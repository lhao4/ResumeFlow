import { ResumeData } from '../types';

export const PRESET_TEMPLATES: { name: string; description: string; data: Partial<ResumeData> }[] = [
  {
    name: '现代简约 (Modern Minimalist)',
    description: '清新、专业，适合大多数互联网及创意岗位。',
    data: {
      style: {
        marginTop: 40,
        marginRight: 40,
        marginBottom: 40,
        marginLeft: 40,
        baseFontSize: 14,
        sectionTitleFontSize: 18,
        profileNameFontSize: 30,
        profileRoleFontSize: 18,
        profileFieldFontSize: 14,
        lineHeight: 1.6,
        themeColor: '#2563eb',
        fontFamily: 'sans-serif',
        dividerColor: '#2563eb',
        dividerWidth: 100,
        dividerHeight: 1,
        layout: 'single',
        sidebarWidth: 30,
        showPageNumbers: true,
        forceSinglePage: false,
        pageSize: 'A4',
      },
      profile: {
        avatarSize: 80,
        avatarShape: 'circle',
        avatarScale: 1,
        avatarX: 0,
        avatarY: 0,
      } as any
    }
  },
  {
    name: '学术严谨 (Academic Rigorous)',
    description: '传统、稳重，适合科研、教育及传统行业。',
    data: {
      style: {
        marginTop: 50,
        marginRight: 50,
        marginBottom: 50,
        marginLeft: 50,
        baseFontSize: 13,
        sectionTitleFontSize: 18,
        profileNameFontSize: 30,
        profileRoleFontSize: 18,
        profileFieldFontSize: 14,
        lineHeight: 1.5,
        themeColor: '#1a1a1a',
        fontFamily: 'serif',
        dividerColor: '#1a1a1a',
        dividerWidth: 100,
        dividerHeight: 2,
        layout: 'single',
        sidebarWidth: 30,
        showPageNumbers: true,
        forceSinglePage: false,
        pageSize: 'A4',
      },
      profile: {
        avatarSize: 0, // No avatar usually
        avatarShape: 'rectangle',
        avatarScale: 1,
        avatarX: 0,
        avatarY: 0,
      } as any
    }
  },
  {
    name: '创意设计 (Creative Design)',
    description: '大胆、独特，适合设计师、媒体人及艺术岗位。',
    data: {
      style: {
        marginTop: 30,
        marginRight: 30,
        marginBottom: 30,
        marginLeft: 30,
        baseFontSize: 14,
        sectionTitleFontSize: 18,
        profileNameFontSize: 24,
        profileRoleFontSize: 14,
        profileFieldFontSize: 12,
        lineHeight: 1.7,
        themeColor: '#db2777',
        fontFamily: 'sans-serif',
        dividerColor: '#fbcfe8',
        dividerWidth: 100,
        dividerHeight: 4,
        layout: 'double',
        sidebarWidth: 28,
        showPageNumbers: true,
        forceSinglePage: false,
        pageSize: 'A4',
      },
      profile: {
        avatarSize: 100,
        avatarShape: 'rounded',
        avatarScale: 1.1,
        avatarX: 0,
        avatarY: 0,
      } as any
    }
  },
  {
    name: '极简商务 (Minimal Business)',
    description: '高效、干练，适合金融、管理及商务岗位。',
    data: {
      style: {
        marginTop: 40,
        marginRight: 40,
        marginBottom: 40,
        marginLeft: 40,
        baseFontSize: 14,
        sectionTitleFontSize: 18,
        profileNameFontSize: 24,
        profileRoleFontSize: 14,
        profileFieldFontSize: 12,
        lineHeight: 1.6,
        themeColor: '#0f172a',
        fontFamily: 'sans-serif',
        dividerColor: '#e2e8f0',
        dividerWidth: 100,
        dividerHeight: 1,
        layout: 'double',
        sidebarWidth: 32,
        showPageNumbers: true,
        forceSinglePage: false,
        pageSize: 'A4',
      },
      profile: {
        avatarSize: 90,
        avatarShape: 'rectangle',
        avatarScale: 1,
        avatarX: 0,
        avatarY: 0,
      } as any
    }
  }
];
