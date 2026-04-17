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
import { Settings, Type, Layout, Image as ImageIcon, Trash2, GripVertical, Eye, EyeOff, Plus, Sparkles, Download, Upload, Columns, Square, Move, Maximize, Crop, Palette, Bookmark, Check, Key } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AIProvider, ProfileField } from '../../types';
import { polishContent, analyzeJD } from '../../services/aiService';
import { getCroppedImg } from '../../lib/imageUtils';
import { useState, useCallback } from 'react';
import MarkdownRenderer from '../resume/MarkdownRenderer';
import Cropper from 'react-easy-crop';
import { PRESET_TEMPLATES } from '../../constants/templates';
import { AI_PROVIDER_PRESETS } from '../../constants/aiProviders';

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
        "flex flex-col gap-2 p-3 rounded-md border bg-gray-50 transition-all overflow-hidden",
        !field.visible && "opacity-50",
        isDragging && "z-50 shadow-lg"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={field.label} 
          onChange={(e) => updateProfileField(field.id, { label: e.target.value })}
          placeholder="标签"
          className="flex-1 min-w-0 bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:ring-0 p-0"
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
          className="text-xs border rounded px-1 py-1 bg-white w-20 flex-shrink-0"
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
          className="flex-1 min-w-0 px-2 py-1 border rounded text-sm bg-white"
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
    smartFitSpacing,
    resetResume,
    customTemplates,
    addCustomTemplate,
    deleteCustomTemplate,
    applyTemplate,
    aiConfig,
    updateAIConfig
  } = useResumeStore();

  const providerPreset = AI_PROVIDER_PRESETS[aiConfig.provider];

  const [isPolishing, setIsPolishing] = useState(false);
  const [jdText, setJdText] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showTemplateInput, setShowTemplateInput] = useState(false);

  // Avatar Cropping State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCrop = async () => {
    if (tempImage && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
        updateProfile({ avatar: croppedImage });
        setShowCropper(false);
        setTempImage(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

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

  const handleProviderChange = (provider: AIProvider) => {
    const preset = AI_PROVIDER_PRESETS[provider];
    updateAIConfig({
      provider,
      model: preset.defaultModel,
      baseUrl: preset.defaultBaseUrl,
      apiKey: '',
    });
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
      <aside className="w-80 border-l bg-white flex flex-col h-full overflow-y-auto p-6 print:hidden">
        {/* Template Library */}
        <section className="mb-8 pb-8 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>模板库</span>
            </div>
            <button
              onClick={() => setShowTemplateInput(!showTemplateInput)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="保存当前样式为模板"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          {showTemplateInput && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="输入模板名称..."
                className="w-full px-2 py-1.5 text-xs border rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (newTemplateName) {
                      addCustomTemplate(newTemplateName);
                      setNewTemplateName('');
                      setShowTemplateInput(false);
                    }
                  }}
                  className="flex-1 py-1 bg-blue-600 text-white text-[10px] rounded"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowTemplateInput(false)}
                  className="flex-1 py-1 bg-gray-200 text-gray-600 text-[10px] rounded"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">预设模板</h4>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => applyTemplate(tpl.data)}
                    className="group relative flex flex-col p-2 border rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700">{tpl.name}</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1">{tpl.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {customTemplates.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">我的模板</h4>
                <div className="grid grid-cols-1 gap-2">
                  {customTemplates.map((tpl) => (
                    <div key={tpl.id} className="group relative flex items-center gap-2">
                      <button
                        onClick={() => applyTemplate({ style: tpl.style, profile: tpl.profile as any })}
                        className="flex-1 p-2 border rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <span className="text-xs font-bold text-gray-700">{tpl.name}</span>
                      </button>
                      <button
                        onClick={() => deleteCustomTemplate(tpl.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-gray-400">
            <Settings className="w-5 h-5" />
            <h2 className="font-semibold text-gray-900">全局设置</h2>
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
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Columns className="w-4 h-4" />
              <span>布局选择</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateStyle({ layout: 'single' })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 border rounded-md transition-all",
                  style.layout === 'single' ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Square className="w-6 h-6" />
                <span className="text-xs font-medium">单栏布局</span>
              </button>
              <button
                onClick={() => updateStyle({ layout: 'double' })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 border rounded-md transition-all",
                  style.layout === 'double' ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Columns className="w-6 h-6" />
                <span className="text-xs font-medium">双栏布局</span>
              </button>
            </div>
            {style.layout === 'double' && (
              <div className="mt-4">
                <label className="block text-xs text-gray-500 mb-1">侧边栏宽度: {style.sidebarWidth}%</label>
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
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Layout className="w-4 h-4" />
              <span>页边距 (px)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">上</label>
                <input 
                  type="number" 
                  value={style.marginTop} 
                  onChange={(e) => updateStyle({ marginTop: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">下</label>
                <input 
                  type="number" 
                  value={style.marginBottom} 
                  onChange={(e) => updateStyle({ marginBottom: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">左</label>
                <input 
                  type="number" 
                  value={style.marginLeft} 
                  onChange={(e) => updateStyle({ marginLeft: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">右</label>
                <input 
                  type="number" 
                  value={style.marginRight} 
                  onChange={(e) => updateStyle({ marginRight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </section>

          {/* Typography */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Type className="w-4 h-4" />
              <span>排版设置</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">基础字号 (px)</label>
                <input 
                  type="number" 
                  value={style.baseFontSize} 
                  onChange={(e) => updateStyle({ baseFontSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">模块标题字号 (px)</label>
                <input 
                  type="number" 
                  value={style.sectionTitleFontSize} 
                  onChange={(e) => updateStyle({ sectionTitleFontSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">姓名字号 (px)</label>
                <input 
                  type="number" 
                  value={style.profileNameFontSize} 
                  onChange={(e) => updateStyle({ profileNameFontSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">职位字号 (px)</label>
                <input 
                  type="number" 
                  value={style.profileRoleFontSize} 
                  onChange={(e) => updateStyle({ profileRoleFontSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">个人信息内容字号 (px)</label>
                <input 
                  type="number" 
                  value={style.profileFieldFontSize} 
                  onChange={(e) => updateStyle({ profileFieldFontSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">主题颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {['#2563eb', '#1e293b', '#059669', '#dc2626', '#7c3aed', '#ea580c'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateStyle({ themeColor: color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        style.themeColor === color ? "border-black scale-110" : "border-transparent"
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showPageNumbers" className="text-xs text-gray-500">显示页码</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="forceSinglePage"
                  checked={style.forceSinglePage}
                  onChange={(e) => updateStyle({ forceSinglePage: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="forceSinglePage" className="text-xs text-gray-500">强制一页排版</label>
              </div>
              {style.forceSinglePage && (
                <button
                  onClick={() => smartFitSpacing()}
                  className="w-full mt-2 py-1.5 border border-blue-200 text-blue-600 rounded-md text-[10px] font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  智能压缩模块间距
                </button>
              )}
            </div>
          </section>

          {/* Divider Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <div className="w-4 h-4 border-b-2 border-gray-900" />
              <span>分割线设置</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">分割线颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {['#2563eb', '#1e293b', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#e2e8f0'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateStyle({ dividerColor: color })}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        style.dividerColor === color ? "border-black scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">粗细 (px): {style.dividerHeight}</label>
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
                  <label className="block text-xs text-gray-500 mb-1">长度 (%): {style.dividerWidth}</label>
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

          {/* PDF Export Settings */}
          <section className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Download className="w-4 h-4" />
              <span>PDF 导出设置</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">页面大小</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStyle({ pageSize: 'A4' })}
                    className={cn(
                      "flex-1 py-1.5 text-xs border rounded-md transition-colors",
                      style.pageSize === 'A4' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
                    )}
                  >
                    A4 (210x297mm)
                  </button>
                  <button
                    onClick={() => updateStyle({ pageSize: 'Letter' })}
                    className={cn(
                      "flex-1 py-1.5 text-xs border rounded-md transition-colors",
                      style.pageSize === 'Letter' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
                    )}
                  >
                    Letter (8.5x11")
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">页眉文字 (仅打印可见)</label>
                <input 
                  type="text" 
                  value={style.printHeader || ''} 
                  placeholder="例如：个人简历 - 张三"
                  onChange={(e) => updateStyle({ printHeader: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">页脚文字 (仅打印可见)</label>
                <input 
                  type="text" 
                  value={style.printFooter || ''} 
                  placeholder="例如：联系电话：138-0000-0000"
                  onChange={(e) => updateStyle({ printFooter: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </section>

          {/* API Key Management */}
          <section className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Key className="w-4 h-4 text-orange-500" />
              <span>API 设置</span>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                已切换为多厂商兼容模式。支持 Gemini、ChatGPT、Claude、Kimi、豆包、GLM、千问、DeepSeek。您可以在这里设置当前厂商的模型、Base URL 和 API Key。
              </p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">服务商</label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                >
                  {Object.entries(AI_PROVIDER_PRESETS).map(([provider, preset]) => (
                    <option key={provider} value={provider}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                {providerPreset.description}
              </p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">模型名称</label>
                <input 
                  type="text"
                  value={aiConfig.model || ''} 
                  onChange={(e) => updateAIConfig({ model: e.target.value })}
                  placeholder={providerPreset.modelPlaceholder || '输入模型名称...'}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base URL</label>
                <input 
                  type="text"
                  value={aiConfig.baseUrl || ''} 
                  onChange={(e) => updateAIConfig({ baseUrl: e.target.value })}
                  placeholder={providerPreset.baseUrlPlaceholder || '当前厂商无需填写 Base URL'}
                  disabled={aiConfig.provider === 'gemini'}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md text-sm",
                    aiConfig.provider === 'gemini' && "bg-gray-50 text-gray-400 cursor-not-allowed"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={aiConfig.apiKey || ''} 
                    onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
                    placeholder={`输入您的 ${providerPreset.label} API Key...`}
                    className="w-full px-3 py-2 border rounded-md text-sm pr-10"
                  />
                  {aiConfig.apiKey && (
                    <button 
                      onClick={() => updateAIConfig({ apiKey: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <Check className={cn("w-3 h-3", aiConfig.apiKey ? "text-green-500" : "text-gray-300")} />
                <span>{aiConfig.apiKey ? "已启用当前厂商的自定义 Key" : `未填写自定义 Key，将尝试读取环境变量 ${providerPreset.apiKeyEnvVar}`}</span>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Download className="w-4 h-4" />
              <span>数据管理</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-2 border rounded-md text-xs hover:bg-gray-50 transition-colors"
              >
                <Download className="w-3 h-3" />
                导出 JSON
              </button>
              <label className="flex items-center justify-center gap-2 p-2 border rounded-md text-xs hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-3 h-3" />
                导入 JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </section>

          {/* AI JD Analysis */}
          <section className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>JD 匹配分析 (AI)</span>
            </div>
            <textarea 
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="粘贴职位描述 (JD)..."
              className="w-full h-32 p-3 border rounded-md text-xs mb-3 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
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
              <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-md text-xs text-purple-900 prose prose-xs">
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
      <aside className="w-80 border-l bg-white flex flex-col h-full overflow-y-auto p-6 print:hidden">
        <h2 className="font-semibold mb-6 text-gray-900">编辑基本信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">姓名</label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">职位/头衔</label>
            <input 
              type="text" 
              value={profile.role} 
              onChange={(e) => updateProfile({ role: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <hr className="my-6" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              <span>联系方式 / 链接</span>
            </div>
            <button
              onClick={() => addProfileField('新字段', '', '')}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
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

          <hr className="my-6" />

          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>照片设置</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">照片 URL</label>
              <input 
                type="text" 
                value={profile.avatar || ''} 
                placeholder="https://..."
                onChange={(e) => updateProfile({ avatar: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                上传本地照片
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {profile.avatar && (
                <button
                  onClick={() => {
                    setTempImage(profile.avatar!);
                    setShowCropper(true);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Crop className="w-3 h-3" />
                  裁剪
                </button>
              )}
            </div>

            {profile.avatar && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">照片大小: {profile.avatarSize}px</label>
                    <input 
                      type="range" 
                      min="40" 
                      max="200"
                      value={profile.avatarSize} 
                      onChange={(e) => updateProfile({ avatarSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">缩放倍数: {profile.avatarScale.toFixed(1)}</label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3"
                      step="0.1"
                      value={profile.avatarScale} 
                      onChange={(e) => updateProfile({ avatarScale: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">整体水平移动: {profile.avatarX}px</label>
                    <input 
                      type="range" 
                      min="-200" 
                      max="200"
                      value={profile.avatarX} 
                      onChange={(e) => updateProfile({ avatarX: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">整体垂直移动: {profile.avatarY}px</label>
                    <input 
                      type="range" 
                      min="-200" 
                      max="200"
                      value={profile.avatarY} 
                      onChange={(e) => updateProfile({ avatarY: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => updateProfile({ avatarScale: 1, avatarX: 0, avatarY: 0 })}
                  className="w-full py-1.5 border border-gray-200 text-gray-500 rounded-md text-[10px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Move className="w-3 h-3" />
                  重置位置与缩放
                </button>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">照片形状</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => updateProfile({ avatarShape: 'circle' })}
                      className={cn(
                        "flex-1 py-2 text-[10px] border rounded-md transition-colors",
                        profile.avatarShape === 'circle' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
                      )}
                    >
                      圆形
                    </button>
                    <button
                      onClick={() => updateProfile({ avatarShape: 'rounded' })}
                      className={cn(
                        "flex-1 py-2 text-[10px] border rounded-md transition-colors",
                        profile.avatarShape === 'rounded' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
                      )}
                    >
                      圆角
                    </button>
                    <button
                      onClick={() => updateProfile({ avatarShape: 'rectangle' })}
                      className={cn(
                        "flex-1 py-2 text-[10px] border rounded-md transition-colors",
                        profile.avatarShape === 'rectangle' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
                      )}
                    >
                      矩形
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cropping Modal */}
        {showCropper && tempImage && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg aspect-square bg-gray-900 rounded-lg overflow-hidden">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={profile.avatarShape === 'rectangle' ? 3/4 : 1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="w-full max-w-lg mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-4 text-white">
                <span className="text-xs">缩放</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setTempImage(null);
                  }}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={applyCrop}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  应用裁剪
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  if (activeSection) {
    return (
      <aside className="w-80 border-l bg-white flex flex-col h-full overflow-y-auto p-6 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">编辑模块</h2>
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
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-blue-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
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
            <p className="mt-2 text-[10px] text-blue-600/70 text-center">
              AI 将根据 STAR 法则自动优化您的描述
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">模块标题</label>
            <input 
              type="text" 
              value={activeSection.title} 
              onChange={(e) => updateSection(activeSection.id, { title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Markdown 内容</label>
            <textarea 
              value={activeSection.markdown} 
              onChange={(e) => updateSection(activeSection.id, { markdown: e.target.value })}
              className="w-full h-96 px-3 py-2 border rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="使用 Markdown 编写内容..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">上间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingTop} 
                onChange={(e) => updateSection(activeSection.id, { spacingTop: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">右间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingRight ?? 0} 
                onChange={(e) => updateSection(activeSection.id, { spacingRight: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">下间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingBottom} 
                onChange={(e) => updateSection(activeSection.id, { spacingBottom: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">左间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingLeft ?? 0} 
                onChange={(e) => updateSection(activeSection.id, { spacingLeft: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
