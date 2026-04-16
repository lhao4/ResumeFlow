import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeStore } from '../../store/useResumeStore';
import { Settings, Type, Layout, Image as ImageIcon, Trash2, GripVertical, Eye, EyeOff, Plus, Sparkles, Download, Upload, Columns, Square } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProfileField } from '../../types';
import { polishContent, analyzeJD } from '../../services/aiService';
import { useState } from 'react';
import MarkdownRenderer from '../resume/MarkdownRenderer';

interface SortableProfileFieldProps {
  field: ProfileField;
}

function SortableProfileField({ field }: SortableProfileFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const { updateProfileField, deleteProfileField } = useResumeStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-md border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 transition-all overflow-hidden",
        !field.visible && "opacity-50",
        isDragging && "z-50 shadow-lg"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={field.label} 
          onChange={(e) => updateProfileField(field.id, { label: e.target.value })}
          placeholder="标签"
          className="flex-1 min-w-0 bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:ring-0 p-0 dark:text-gray-200"
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => updateProfileField(field.id, { visible: !field.visible })}
            className="p-1 text-gray-400 hover:text-blue-500 rounded"
          >
            {field.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteProfileField(field.id)}
            className="p-1 text-gray-400 hover:text-red-500 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 min-w-0">
        <select
          value={field.icon || ''}
          onChange={(e) => updateProfileField(field.id, { icon: e.target.value })}
          className="text-xs border rounded px-1 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-20 flex-shrink-0"
        >
          <option value="">无图标</option>
          <option value="Phone">电话</option>
          <option value="Mail">邮箱</option>
          <option value="MapPin">地点</option>
          <option value="Github">Github</option>
          <option value="Globe">网站</option>
          <option value="Linkedin">Linkedin</option>
          <option value="Twitter">Twitter</option>
          <option value="MessageSquare">微信</option>
        </select>
        <input 
          type="text" 
          value={field.value} 
          onChange={(e) => updateProfileField(field.id, { value: e.target.value })}
          placeholder="内容"
          className="flex-1 min-w-0 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  );
}

export default function Inspector() {
  const { 
    activeSectionId, 
    sections, 
    updateSection, 
    deleteSection,
    profile,
    updateProfile,
    addProfileField,
    reorderProfileFields,
    style,
    updateStyle,
    resetResume,
    darkMode
  } = useResumeStore();

  const [isPolishing, setIsPolishing] = useState(false);
  const [jdText, setJdText] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const fields = profile.fields || [];
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      reorderProfileFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const handlePolish = async () => {
    if (!activeSectionId || activeSectionId === 'profile') return;
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;

    setIsPolishing(true);
    const polished = await polishContent(section.markdown, section.type as any);
    updateSection(section.id, { markdown: polished });
    setIsPolishing(false);
  };

  const handleJDAnalysis = async () => {
    if (!jdText) return;
    setIsAnalyzing(true);
    const resumeText = sections.map(s => s.markdown).join('\n');
    const result = await analyzeJD(resumeText, jdText);
    setJdAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleExport = () => {
    const data = useResumeStore.getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        useResumeStore.setState(data);
      } catch (err) {
        alert('导入失败，文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  const activeSection = sections.find(s => s.id === activeSectionId);

  if (!activeSectionId) {
    return (
      <aside className="w-80 border-l bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full overflow-y-auto p-6 print:hidden transition-colors duration-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <Settings className="w-5 h-5" />
            <h2 className="font-semibold dark:text-white">全局设置</h2>
          </div>
          <button 
            onClick={resetResume}
            className="text-xs text-red-500 hover:underline"
          >
            重置全部
          </button>
        </div>

        <div className="space-y-8">
          {/* Layout Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <Columns className="w-4 h-4" />
              <span>布局选择</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateStyle({ layout: 'single' })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 border rounded-md transition-all",
                  style.layout === 'single' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300"
                )}
              >
                <Square className="w-6 h-6" />
                <span className="text-xs font-medium">单栏布局</span>
              </button>
              <button
                onClick={() => updateStyle({ layout: 'double' })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 border rounded-md transition-all",
                  style.layout === 'double' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300"
                )}
              >
                <Columns className="w-6 h-6" />
                <span className="text-xs font-medium">双栏布局</span>
              </button>
            </div>
            {style.layout === 'double' && (
              <div className="mt-4">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">侧边栏宽度: {style.sidebarWidth}%</label>
                <input 
                  type="range" 
                  min="20" 
                  max="45"
                  value={style.sidebarWidth} 
                  onChange={(e) => updateStyle({ sidebarWidth: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </section>

          {/* Margins */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <Layout className="w-4 h-4" />
              <span>页边距 (px)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">上</label>
                <input 
                  type="number" 
                  value={style.marginTop} 
                  onChange={(e) => updateStyle({ marginTop: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">下</label>
                <input 
                  type="number" 
                  value={style.marginBottom} 
                  onChange={(e) => updateStyle({ marginBottom: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">左</label>
                <input 
                  type="number" 
                  value={style.marginLeft} 
                  onChange={(e) => updateStyle({ marginLeft: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">右</label>
                <input 
                  type="number" 
                  value={style.marginRight} 
                  onChange={(e) => updateStyle({ marginRight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Typography */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <Type className="w-4 h-4" />
              <span>排版设置</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">基础字号 (px)</label>
                <input 
                  type="number" 
                  value={style.baseFontSize} 
                  onChange={(e) => updateStyle({ baseFontSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">主题颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {['#2563eb', '#1e293b', '#059669', '#dc2626', '#7c3aed', '#ea580c'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateStyle({ themeColor: color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        style.themeColor === color ? "border-black dark:border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={style.themeColor}
                    onChange={(e) => updateStyle({ themeColor: e.target.value })}
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showPageNumbers"
                  checked={style.showPageNumbers}
                  onChange={(e) => updateStyle({ showPageNumbers: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showPageNumbers" className="text-xs text-gray-500 dark:text-gray-400">显示页码</label>
              </div>
            </div>
          </section>

          {/* Divider Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <div className="w-4 h-4 border-b-2 border-gray-900 dark:border-gray-100" />
              <span>分割线设置</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">分割线颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {['#2563eb', '#1e293b', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#e2e8f0'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateStyle({ dividerColor: color })}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        style.dividerColor === color ? "border-black dark:border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">粗细 (px): {style.dividerHeight}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10"
                    step="0.5"
                    value={style.dividerHeight} 
                    onChange={(e) => updateStyle({ dividerHeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">长度 (%): {style.dividerWidth}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="100"
                    value={style.dividerWidth} 
                    onChange={(e) => updateStyle({ dividerWidth: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <Download className="w-4 h-4" />
              <span>数据管理</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-2 border dark:border-gray-700 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
              >
                <Download className="w-3 h-3" />
                导出 JSON
              </button>
              <label className="flex items-center justify-center gap-2 p-2 border dark:border-gray-700 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors cursor-pointer">
                <Upload className="w-3 h-3" />
                导入 JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </section>

          {/* AI JD Analysis */}
          <section className="pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>JD 匹配分析 (AI)</span>
            </div>
            <textarea 
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="粘贴职位描述 (JD)..."
              className="w-full h-32 p-3 border dark:border-gray-700 rounded-md text-xs mb-3 resize-none focus:ring-2 focus:ring-purple-500 outline-none dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleJDAnalysis}
              disabled={isAnalyzing || !jdText}
              className="w-full py-2 bg-purple-600 text-white rounded-md text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? "正在分析..." : "开始 AI 匹配分析"}
              <Sparkles className="w-3 h-3" />
            </button>
            {jdAnalysis && (
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-md text-xs text-purple-900 dark:text-purple-200 prose prose-xs dark:prose-invert">
                <MarkdownRenderer content={jdAnalysis} />
              </div>
            )}
          </section>
        </div>
      </aside>
    );
  }

  if (activeSectionId === 'profile') {
    return (
      <aside className="w-80 border-l bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full overflow-y-auto p-6 print:hidden transition-colors duration-200">
        <h2 className="font-semibold mb-6 dark:text-white">编辑基本信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">姓名</label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">职位/头衔</label>
            <input 
              type="text" 
              value={profile.role} 
              onChange={(e) => updateProfile({ role: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <hr className="my-6 dark:border-gray-700" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              <span>联系方式 / 链接</span>
            </div>
            <button
              onClick={() => addProfileField('新字段', '', '')}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="添加字段"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(profile.fields || []).map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {(profile.fields || []).map((field) => (
                  <SortableProfileField key={field.id} field={field} />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <hr className="my-6 dark:border-gray-700" />

          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>照片设置</span>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">照片 URL</label>
            <input 
              type="text" 
              value={profile.avatar || ''} 
              placeholder="https://..."
              onChange={(e) => updateProfile({ avatar: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {profile.avatar && (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">照片大小: {profile.avatarSize}px</label>
                <input 
                  type="range" 
                  min="40" 
                  max="150"
                  value={profile.avatarSize} 
                  onChange={(e) => updateProfile({ avatarSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">照片形状</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => updateProfile({ avatarShape: 'circle' })}
                    className={cn(
                      "flex-1 py-2 text-xs border rounded-md transition-colors",
                      profile.avatarShape === 'circle' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300"
                    )}
                  >
                    圆形
                  </button>
                  <button
                    onClick={() => updateProfile({ avatarShape: 'rounded' })}
                    className={cn(
                      "flex-1 py-2 text-xs border rounded-md transition-colors",
                      profile.avatarShape === 'rounded' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300"
                    )}
                  >
                    圆角矩形
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    );
  }

  if (activeSection) {
    return (
      <aside className="w-80 border-l bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full overflow-y-auto p-6 print:hidden transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold dark:text-white">编辑模块</h2>
          <button
            onClick={() => deleteSection(activeSection.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="删除模块"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* AI Tools for Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>AI 助手</span>
            </div>
            <button
              onClick={handlePolish}
              disabled={isPolishing || !activeSection.markdown}
              className="w-full py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPolishing ? "正在润色..." : "一键 AI 润色 (STAR 法则)"}
              <Sparkles className="w-3 h-3" />
            </button>
            <p className="mt-2 text-[10px] text-blue-600/70 dark:text-blue-400/70 text-center">
              AI 将根据 STAR 法则自动优化您的描述
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">模块标题</label>
            <input 
              type="text" 
              value={activeSection.title} 
              onChange={(e) => updateSection(activeSection.id, { title: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm font-medium dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Markdown 内容</label>
            <textarea 
              value={activeSection.markdown} 
              onChange={(e) => updateSection(activeSection.id, { markdown: e.target.value })}
              className="w-full h-96 px-3 py-2 border dark:border-gray-700 rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
              placeholder="使用 Markdown 编写内容..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">上间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingTop} 
                onChange={(e) => updateSection(activeSection.id, { spacingTop: Number(e.target.value) })}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">下间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingBottom} 
                onChange={(e) => updateSection(activeSection.id, { spacingBottom: Number(e.target.value) })}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
