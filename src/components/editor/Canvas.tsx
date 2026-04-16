import { useResumeStore } from '../../store/useResumeStore';
import MarkdownRenderer from '../resume/MarkdownRenderer';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

export default function Canvas() {
  const { profile, sections, style, activeSectionId, setActiveSectionId, smartFitSpacing } = useResumeStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isAutoFitting, setIsAutoFitting] = useState(false);

  // A4 dimensions in pixels at 96 DPI: 210mm x 297mm -> 794px x 1123px
  const PAGE_HEIGHT_MM = 297;
  const PAGE_HEIGHT_PX = (PAGE_HEIGHT_MM * 96) / 25.4;

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      const pages = Math.ceil(height / PAGE_HEIGHT_PX);
      setPageCount(pages || 1);
      setIsOverflowing(height > PAGE_HEIGHT_PX);
    }
  }, [sections, profile, style, PAGE_HEIGHT_PX]);

  // Automatic spacing reduction logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (style.forceSinglePage && isOverflowing && isAutoFitting) {
      const hasSpacing = sections.some(s => s.spacingTop > 0 || s.spacingBottom > 0);
      if (hasSpacing) {
        timer = setTimeout(() => {
          smartFitSpacing();
        }, 50); // Small delay for visual "step by step" effect
      } else {
        setIsAutoFitting(false);
      }
    } else if (!isOverflowing) {
      setIsAutoFitting(false);
    }
    return () => clearTimeout(timer);
  }, [style.forceSinglePage, isOverflowing, isAutoFitting, sections, smartFitSpacing]);

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

  const renderContent = () => {
    if (style.layout === 'single') {
      return (
        <>
          {/* Profile Header */}
          <header 
            className="mb-6 flex justify-between items-start border-b pb-6 cursor-pointer transition-all"
            onClick={() => setActiveSectionId('profile')}
          >
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
            {visibleSections.map(section => (
              <div 
                key={section.id}
                className="group relative p-4 transition-all cursor-pointer"
                onClick={() => setActiveSectionId(section.id)}
              >
                {renderSection(section)}
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="flex gap-8 h-full">
        {/* Sidebar */}
        <aside style={{ width: `${style.sidebarWidth}%` }} className="flex-shrink-0">
          <div 
            className="p-4 transition-all cursor-pointer mb-6"
            onClick={() => setActiveSectionId('profile')}
          >
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
          </div>

          <div className="space-y-6">
            {sidebarSections.map(section => (
              <div 
                key={section.id}
                className="p-4 transition-all cursor-pointer"
                onClick={() => setActiveSectionId(section.id)}
              >
                {renderSection(section)}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 border-l pl-8" style={{ borderColor: style.themeColor + '10' }}>
          <div className="space-y-0">
            {mainSections.map(section => (
              <div 
                key={section.id}
                className="p-4 transition-all cursor-pointer"
                onClick={() => setActiveSectionId(section.id)}
              >
                {renderSection(section)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center print:bg-white print:p-0 print:overflow-visible bg-gray-200">
      {/* Page Container */}
      <div className="relative flex flex-col gap-8 print:gap-0">
        {/* Render multiple page backgrounds */}
        {Array.from({ length: style.forceSinglePage ? 1 : pageCount }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "bg-white shadow-2xl w-[210mm] h-[297mm] print:shadow-none print:w-full relative text-gray-900 overflow-hidden",
              style.forceSinglePage && isOverflowing && i === 0 && "border-4 border-red-500/50"
            )}
          >
            {/* Page Number */}
            {style.showPageNumbers && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-gray-300 print:block">
                {i + 1} / {style.forceSinglePage ? 1 : pageCount}
              </div>
            )}
          </div>
        ))}

        {/* Content Layer (Absolute positioned over the backgrounds) */}
        <div 
          ref={contentRef}
          className={cn(
            "absolute top-0 left-0 w-[210mm] text-gray-900 print:w-full",
            style.forceSinglePage ? "max-h-[297mm] overflow-hidden" : "h-fit"
          )}
          style={pageStyle}
        >
          {renderContent()}
        </div>

        {/* Overflow Warning */}
        {style.forceSinglePage && isOverflowing && (
          <div className="absolute -top-12 left-0 right-0 bg-red-500 text-white text-[10px] py-1.5 px-3 rounded-t-md font-bold flex items-center justify-between gap-2 animate-pulse print:hidden">
            <div className="flex items-center gap-2">
              <Icons.AlertTriangle className="w-3 h-3" />
              <span>内容已超过一页限制，部分内容将被截断。</span>
            </div>
            <button 
              onClick={() => setIsAutoFitting(true)}
              disabled={isAutoFitting}
              className="bg-white text-red-600 px-2 py-0.5 rounded text-[9px] hover:bg-gray-100 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Icons.Sparkles className="w-2.5 h-2.5" />
              {isAutoFitting ? "正在压缩..." : "智能压缩间距"}
            </button>
          </div>
        )}
      </div>
      
      {/* Word Count & Page Info (Floating) */}
      <div className="mt-8 text-xs text-gray-400 flex gap-4 print:hidden">
        <span>字数统计: {sections.reduce((acc, s) => acc + s.markdown.length, 0)} 字符</span>
        <span>当前页数: {style.forceSinglePage ? 1 : pageCount} 页 (A4)</span>
        {style.forceSinglePage && isOverflowing && (
          <span className="text-red-500 font-bold">内容溢出！</span>
        )}
      </div>
    </main>
  );
}
