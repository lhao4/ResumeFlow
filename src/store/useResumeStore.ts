import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ResumeData, ResumeSection, ResumeStyle, Profile, ProfileField } from '../types';

interface ResumeState extends ResumeData {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  addProfileField: (label: string, value: string, icon?: string) => void;
  updateProfileField: (id: string, field: Partial<ProfileField>) => void;
  deleteProfileField: (id: string) => void;
  reorderProfileFields: (fields: ProfileField[]) => void;
  updateStyle: (style: Partial<ResumeStyle>) => void;
  updateMeta: (meta: Partial<{ title: string }>) => void;
  addSection: (type: string, title: string) => void;
  updateSection: (id: string, section: Partial<ResumeSection>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (sections: ResumeSection[]) => void;
  resetResume: () => void;
}

const DEFAULT_DATA: ResumeData = {
  meta: {
    title: '我的简历',
  },
  profile: {
    name: '张三',
    role: '全栈开发工程师',
    avatarSize: 80,
    avatarShape: 'circle',
    fields: [
      { id: uuidv4(), label: '电话', value: '138-0000-0000', icon: 'Phone', visible: true },
      { id: uuidv4(), label: '邮箱', value: 'zhangsan@example.com', icon: 'Mail', visible: true },
      { id: uuidv4(), label: '地点', value: '北京', icon: 'MapPin', visible: true },
      { id: uuidv4(), label: 'GitHub', value: 'github.com/zhangsan', icon: 'Github', visible: true },
    ],
  },
  sections: [
    {
      id: uuidv4(),
      type: 'education',
      title: '教育经历',
      markdown: '### 北京大学\n**计算机科学与技术** | 本科 | 2018.09 - 2022.06\n- 主修课程：数据结构、算法分析、操作系统、计算机网络、数据库系统等。\n- 荣誉奖项：国家奖学金（前1%）、校优秀毕业生。',
      visible: true,
      spacingTop: 10,
      spacingBottom: 10,
    },
    {
      id: uuidv4(),
      type: 'experience',
      title: '工作经历',
      markdown: '### 某互联网大厂\n**高级前端工程师** | 2022.07 - 至今\n- 负责核心业务线的研发工作，支撑日活千万级用户。\n- 主导了前端架构升级，将首屏加载速度提升了 40%。\n- 沉淀了多套通用组件库，并在全公司范围内推广使用。',
      visible: true,
      spacingTop: 10,
      spacingBottom: 10,
    },
    {
      id: uuidv4(),
      type: 'projects',
      title: '项目经历',
      markdown: '### 个人开源项目：Markdown 简历编辑器\n**核心开发者** | 2023.01 - 2023.03\n- 使用 React + TypeScript + Tailwind CSS 开发。\n- 实现了模块化编辑、实时预览、PDF 导出等核心功能。\n- GitHub Star 数突破 1k+，获得社区广泛好评。',
      visible: true,
      spacingTop: 10,
      spacingBottom: 10,
    },
    {
      id: uuidv4(),
      type: 'skills',
      title: '专业技能',
      markdown: '- **前端**：React, Vue, TypeScript, Next.js, Tailwind CSS\n- **后端**：Node.js, Go, MySQL, Redis\n- **工具**：Git, Docker, Webpack, Vite',
      visible: true,
      spacingTop: 10,
      spacingBottom: 10,
    },
  ],
  style: {
    marginTop: 40,
    marginRight: 40,
    marginBottom: 40,
    marginLeft: 40,
    baseFontSize: 14,
    lineHeight: 1.6,
    themeColor: '#2563eb',
    fontFamily: 'sans-serif',
  },
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      ...DEFAULT_DATA,
      activeSectionId: null,
      setActiveSectionId: (id) => set({ activeSectionId: id }),
      updateProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),
      addProfileField: (label, value, icon) =>
        set((state) => ({
          profile: {
            ...state.profile,
            fields: [
              ...state.profile.fields,
              { id: uuidv4(), label, value, icon, visible: true },
            ],
          },
        })),
      updateProfileField: (id, updatedField) =>
        set((state) => ({
          profile: {
            ...state.profile,
            fields: state.profile.fields.map((f) =>
              f.id === id ? { ...f, ...updatedField } : f
            ),
          },
        })),
      deleteProfileField: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            fields: state.profile.fields.filter((f) => f.id !== id),
          },
        })),
      reorderProfileFields: (fields) =>
        set((state) => ({
          profile: { ...state.profile, fields },
        })),
      updateStyle: (style) =>
        set((state) => ({ style: { ...state.style, ...style } })),
      updateMeta: (meta) =>
        set((state) => ({ meta: { ...state.meta, ...meta } })),
      addSection: (type, title) =>
        set((state) => ({
          sections: [
            ...state.sections,
            {
              id: uuidv4(),
              type,
              title,
              markdown: '',
              visible: true,
              spacingTop: 10,
              spacingBottom: 10,
            },
          ],
        })),
      updateSection: (id, updatedSection) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...updatedSection } : s
          ),
        })),
      deleteSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
          activeSectionId: state.activeSectionId === id ? null : state.activeSectionId,
        })),
      reorderSections: (sections) => set({ sections }),
      resetResume: () => set({ ...DEFAULT_DATA, activeSectionId: null }),
    }),
    {
      name: 'resume-storage',
    }
  )
);
