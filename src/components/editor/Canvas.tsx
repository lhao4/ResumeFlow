import { useResumeStore } from '../../store/useResumeStore';
import MarkdownRenderer from '../resume/MarkdownRenderer';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export default function Canvas() {
  const { profile, sections, style, darkMode } = useResumeStore();

  const pageStyle = {
    paddingTop: `${style.marginTop}px`,
    paddingRight: `${style.marginRight}px`,
    paddingBottom: `${style.marginBottom}px`,
    paddingLeft: `${style.marginLeft}px`,
    fontSize: `${style.baseFontSize}px`,
    lineHeight: style.lineHeight,
    fontFamily: style.fontFamily,
  };

  const visibleSections = sections.filter(s => s.visible);

  // For double layout, we'll put 'skills' and 'summary' in the sidebar if they exist
  const sidebarSections = visibleSections.filter(s => ['skills', 'summary', 'awards'].includes(s.type));
  const mainSections = visibleSections.filter(s => !['skills', 'summary', 'awards'].includes(s.type));

  // Find website URL for QR code
  const websiteField = profile.fields?.find(f => f.icon === 'Globe' && f.visible);

  const renderSection = (section: any) => (
    <section 
      key={section.id} 
      style={{ 
        marginTop: `${section.spacingTop}px`, 
        marginBottom: `${section.spacingBottom}px` 
      }}
    >
      <div className="flex flex-col mb-2">
        <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: style.themeColor }}>
          {section.title}
        </h2>
        <div 
          style={{ 
            backgroundColor: style.dividerColor,
            height: `${style.dividerHeight}px`,
            width: `${style.dividerWidth}%`,
            marginTop: '2px'
          }} 
        />
      </div>
      <MarkdownRenderer content={section.markdown} />
    </section>
  );

  return (
    <main className={cn("flex-1 overflow-y-auto p-8 flex flex-col items-center print:bg-white print:p-0 print:overflow-visible transition-colors duration-200", darkMode ? "bg-gray-900" : "bg-gray-200")}>
      {/* A4 Page Container */}
      <div 
        className="bg-white shadow-2xl w-[210mm] min-h-[297mm] h-fit print:shadow-none print:w-full relative"
        style={pageStyle}
      >
        {style.layout === 'single' ? (
          <>
            {/* Profile Header */}
            <header className="mb-6 flex justify-between items-start border-b pb-6" style={{ borderColor: style.themeColor + '20' }}>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: style.themeColor }}>
                  {profile.name}
                </h1>
                <p className="text-lg font-medium text-gray-600 mb-4">{profile.role}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                  {(profile.fields || []).filter(f => f.visible).map((field) => {
                    const IconComponent = (Icons as any)[field.icon || ''] || null;
                    return (
                      <div key={field.id} className="flex items-center gap-1">
                        {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                        <span>{field.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-6">
                {websiteField && (
                  <div className="flex flex-col items-center p-1.5 border rounded bg-white shadow-sm">
                    <QRCodeSVG value={websiteField.value} size={60} />
                    <p className="text-[8px] text-gray-400 mt-1">扫码访问</p>
                  </div>
                )}

                {profile.avatar && (
                  <div 
                    className={cn(
                      "overflow-hidden border-2 bg-gray-50 flex-shrink-0",
                      profile.avatarShape === 'circle' ? "rounded-full" : "rounded-lg"
                    )}
                    style={{ 
                      width: `${profile.avatarSize}px`, 
                      height: `${profile.avatarSize}px`,
                      borderColor: style.themeColor + '40'
                    }}
                  >
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </header>

            {/* Sections */}
            <div className="space-y-0">
              {visibleSections.map(renderSection)}
            </div>
          </>
        ) : (
          <div className="flex gap-8 h-full">
            {/* Sidebar */}
            <aside style={{ width: `${style.sidebarWidth}%` }} className="flex-shrink-0">
              {profile.avatar && (
                <div 
                  className={cn(
                    "overflow-hidden border-2 bg-gray-50 mb-6 mx-auto",
                    profile.avatarShape === 'circle' ? "rounded-full" : "rounded-lg"
                  )}
                  style={{ 
                    width: `${profile.avatarSize}px`, 
                    height: `${profile.avatarSize}px`,
                    borderColor: style.themeColor + '40'
                  }}
                >
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <h1 className="text-2xl font-bold mb-1" style={{ color: style.themeColor }}>
                {profile.name}
              </h1>
              <p className="text-sm font-medium text-gray-600 mb-6">{profile.role}</p>

              <div className="space-y-3 mb-8">
                {(profile.fields || []).filter(f => f.visible).map((field) => {
                  const IconComponent = (Icons as any)[field.icon || ''] || null;
                  return (
                    <div key={field.id} className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{field.label}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {IconComponent && <IconComponent className="w-3 h-3" />}
                        <span className="break-all">{field.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {websiteField && (
                <div className="mb-8 flex flex-col items-center p-2 border rounded bg-white shadow-sm">
                  <QRCodeSVG value={websiteField.value} size={80} />
                  <p className="text-[10px] text-gray-400 mt-1">扫码访问个人主页</p>
                </div>
              )}

              <div className="space-y-6">
                {sidebarSections.map(renderSection)}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 border-l pl-8" style={{ borderColor: style.themeColor + '10' }}>
              <div className="space-y-0">
                {mainSections.map(renderSection)}
              </div>
            </div>
          </div>
        )}

        {/* Page Number */}
        {style.showPageNumbers && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-gray-300 print:block">
            1 / 1
          </div>
        )}
      </div>
      
      {/* Word Count & Page Info (Floating) */}
      <div className="mt-4 text-xs text-gray-400 flex gap-4 print:hidden">
        <span>字数统计: {sections.reduce((acc, s) => acc + s.markdown.length, 0)} 字符</span>
        <span>建议页数: 1 页 (A4)</span>
      </div>
    </main>
  );
}
