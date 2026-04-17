export type ResumeSection = {
  id: string;
  type: string;
  title: string;
  markdown: string;
  visible: boolean;
  spacingTop: number;
  spacingRight: number;
  spacingBottom: number;
  spacingLeft: number;
};

export type ResumeStyle = {
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  baseFontSize: number;
  sectionTitleFontSize: number;
  profileNameFontSize: number;
  profileRoleFontSize: number;
  profileFieldFontSize: number;
  lineHeight: number;
  themeColor: string;
  fontFamily: string;
  dividerColor: string;
  dividerWidth: number; // percentage 0-100
  dividerHeight: number; // thickness in px
  profileDividerOffset: number; // horizontal offset in px for the profile divider
  profileDividerOffsetY: number; // vertical offset in px for the profile divider
  layout: 'single' | 'double';
  sidebarWidth: number; // percentage for double layout
  showPageNumbers: boolean;
  forceSinglePage: boolean;
  pageSize: 'A4' | 'Letter';
  printHeader?: string;
  printFooter?: string;
};

export type ProfileField = {
  id: string;
  label: string;
  value: string;
  icon?: string;
  visible: boolean;
};

export type Profile = {
  name: string;
  role: string;
  avatar?: string;
  avatarSize: number;
  avatarShape: 'circle' | 'rounded' | 'rectangle';
  avatarScale: number;
  avatarX: number;
  avatarY: number;
  fields: ProfileField[];
};

export type Template = {
  id: string;
  name: string;
  style: ResumeStyle;
  profile: Partial<Profile>;
};

export type AIProvider =
  | 'gemini'
  | 'openai'
  | 'claude'
  | 'kimi'
  | 'doubao'
  | 'glm'
  | 'qwen'
  | 'deepseek';

export type AIProtocol = 'gemini' | 'anthropic' | 'openai-compatible';

export type AIConfig = {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
};

export type ResumeData = {
  meta: {
    title: string;
  };
  profile: Profile;
  sections: ResumeSection[];
  style: ResumeStyle;
  customTemplates: Template[];
  aiConfig: AIConfig;
  apiKey?: string;
};
