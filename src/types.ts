export type ResumeSection = {
  id: string;
  type: string;
  title: string;
  markdown: string;
  visible: boolean;
  spacingTop: number;
  spacingBottom: number;
};

export type ResumeStyle = {
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  baseFontSize: number;
  lineHeight: number;
  themeColor: string;
  fontFamily: string;
  dividerColor: string;
  dividerWidth: number; // percentage 0-100
  dividerHeight: number; // thickness in px
  layout: 'single' | 'double';
  sidebarWidth: number; // percentage for double layout
  showPageNumbers: boolean;
  forceSinglePage: boolean;
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

export type ResumeData = {
  meta: {
    title: string;
  };
  profile: Profile;
  sections: ResumeSection[];
  style: ResumeStyle;
  customTemplates: Template[];
};
