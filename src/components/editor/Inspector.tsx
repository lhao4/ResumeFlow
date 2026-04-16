import { useResumeStore } from '../../store/useResumeStore';
import { Settings, Type, Layout, Image as ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Inspector() {
  const { 
    activeSectionId, 
    sections, 
    updateSection, 
    deleteSection,
    profile,
    updateProfile,
    style,
    updateStyle
  } = useResumeStore();

  const activeSection = sections.find(s => s.id === activeSectionId);

  if (!activeSectionId) {
    return (
      <aside className="w-80 border-l bg-white flex flex-col h-full overflow-y-auto p-6 print:hidden">
        <div className="flex items-center gap-2 text-gray-400 mb-8">
          <Settings className="w-5 h-5" />
          <h2 className="font-semibold">全局设置</h2>
        </div>

        <div className="space-y-8">
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
                <label className="block text-xs text-gray-500 mb-1">行高</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={style.lineHeight} 
                  onChange={(e) => updateStyle({ lineHeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">字体</label>
                <select 
                  value={style.fontFamily} 
                  onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="sans-serif">无衬线体 (Sans-serif)</option>
                  <option value="serif">衬线体 (Serif)</option>
                  <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">等宽体 (Monospace)</option>
                </select>
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
            </div>
          </section>
        </div>
      </aside>
    );
  }

  if (activeSectionId === 'profile') {
    return (
      <aside className="w-80 border-l bg-white flex flex-col h-full overflow-y-auto p-6 print:hidden">
        <h2 className="font-semibold mb-6">编辑基本信息</h2>
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">电话</label>
            <input 
              type="text" 
              value={profile.phone} 
              onChange={(e) => updateProfile({ phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">邮箱</label>
            <input 
              type="text" 
              value={profile.email} 
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">地点</label>
            <input 
              type="text" 
              value={profile.location || ''} 
              onChange={(e) => updateProfile({ location: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">GitHub</label>
            <input 
              type="text" 
              value={profile.github || ''} 
              onChange={(e) => updateProfile({ github: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">个人网站</label>
            <input 
              type="text" 
              value={profile.website || ''} 
              onChange={(e) => updateProfile({ website: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <hr className="my-6" />

          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>照片设置</span>
          </div>
          
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

          {profile.avatar && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">照片大小: {profile.avatarSize}px</label>
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
                <label className="block text-xs text-gray-500 mb-1">照片形状</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => updateProfile({ avatarShape: 'circle' })}
                    className={cn(
                      "flex-1 py-2 text-xs border rounded-md transition-colors",
                      profile.avatarShape === 'circle' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
                    )}
                  >
                    圆形
                  </button>
                  <button
                    onClick={() => updateProfile({ avatarShape: 'rounded' })}
                    className={cn(
                      "flex-1 py-2 text-xs border rounded-md transition-colors",
                      profile.avatarShape === 'rounded' ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"
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
      <aside className="w-80 border-l bg-white flex flex-col h-full overflow-y-auto p-6 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">编辑模块</h2>
          <button
            onClick={() => deleteSection(activeSection.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="删除模块"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
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
              <label className="block text-xs text-gray-500 mb-1">下间距 (px)</label>
              <input 
                type="number" 
                value={activeSection.spacingBottom} 
                onChange={(e) => updateSection(activeSection.id, { spacingBottom: Number(e.target.value) })}
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
