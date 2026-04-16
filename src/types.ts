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
};

export type Profile = {
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar?: string;
  avatarSize: number;
  avatarShape: 'circle' | 'rounded';
  github?: string;
  website?: string;
  location?: string;
};

export type ResumeData = {
  meta: {
    title: string;
  };
  profile: Profile;
  sections: ResumeSection[];
  style: ResumeStyle;
};
