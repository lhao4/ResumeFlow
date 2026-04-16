import { useResumeStore } from '../../store/useResumeStore';
import MarkdownRenderer from '../resume/MarkdownRenderer';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Canvas() {
  const { profile, sections, style } = useResumeStore();

  const pageStyle = {
    paddingTop: `${style.marginTop}px`,
    paddingRight: `${style.marginRight}px`,
    paddingBottom: `${style.marginBottom}px`,
    paddingLeft: `${style.marginLeft}px`,
    fontSize: `${style.baseFontSize}px`,
    lineHeight: style.lineHeight,
    fontFamily: style.fontFamily,
  };

  return (
    <main className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center print:bg-white print:p-0 print:overflow-visible">
      {/* A4 Page Container */}
      <div 
        className="bg-white shadow-2xl w-[210mm] min-h-[297mm] h-fit print:shadow-none print:w-full"
        style={pageStyle}
      >
        {/* Profile Header */}
        <header className="mb-6 flex justify-between items-start border-b pb-6" style={{ borderColor: style.themeColor + '20' }}>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" style={{ color: style.themeColor }}>
              {profile.name}
            </h1>
            <p className="text-lg font-medium text-gray-600 mb-4">{profile.role}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
              {profile.fields.filter(f => f.visible).map((field) => {
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

          {profile.avatar && (
            <div 
              className={cn(
                "overflow-hidden border-2 bg-gray-50 flex-shrink-0 ml-6",
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
        </header>

        {/* Sections */}
        <div className="space-y-0">
          {sections.filter(s => s.visible).map((section) => (
            <section 
              key={section.id} 
              style={{ 
                marginTop: `${section.spacingTop}px`, 
                marginBottom: `${section.spacingBottom}px` 
              }}
            >
              <div className="flex items-center gap-3 mb-2 border-b pb-1" style={{ borderColor: style.themeColor + '40' }}>
                <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: style.themeColor }}>
                  {section.title}
                </h2>
              </div>
              <MarkdownRenderer content={section.markdown} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
