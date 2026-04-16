# ResumeFlow

一个面向校招生、程序员和知识工作者的 Markdown 在线简历编辑器。项目提供模块化编辑、实时预览、模板切换、JSON 导入导出、AI 润色与 JD 匹配分析，并支持直接打印导出 PDF。

## 项目特性

- Markdown 编写简历内容，预览区实时渲染
- 左侧模块管理，支持新增、删除、显示隐藏、拖拽排序
- 基本信息可自由扩展联系方式字段，并支持图标配置
- 支持头像上传、裁剪、缩放、位置调整与形状切换
- 提供单栏 / 双栏两种布局
- 支持页边距、字号、行高、主题色、分隔线、页码、页眉页脚等样式配置
- 提供预设模板和自定义模板保存
- 支持强制单页排版与智能压缩间距
- 支持 JSON 数据导入导出
- 支持撤销 / 重做
- 支持浏览器打印导出 PDF
- 集成 Gemini API，可用于内容润色、项目扩写和 JD 匹配分析

## 适用场景

- 快速制作一份结构清晰的技术简历
- 用 Markdown 维护多版本简历
- 针对不同岗位快速调整简历内容
- 在投递前使用 AI 做内容优化和岗位匹配检查

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Zustand + zundo
- `@dnd-kit` 拖拽排序
- `react-markdown`
- `react-easy-crop`
- `qrcode.react`
- `@google/genai`

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`。如果要启用 AI 功能，可按所选厂商填写对应 Key，例如：

```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
KIMI_API_KEY=your_kimi_api_key
DOUBAO_API_KEY=your_doubao_api_key
GLM_API_KEY=your_glm_api_key
QWEN_API_KEY=your_qwen_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

说明：

- AI 功能支持 `Gemini`、`ChatGPT / OpenAI`、`Claude`、`Kimi`、`豆包`、`GLM`、`千问`、`DeepSeek`
- 右侧 API 设置面板支持切换服务商、填写模型名、Base URL 和自定义 API Key
- 如果不想写入本地环境变量，也可以直接在应用右侧设置面板中填写当前厂商的 Key
- 豆包通常需要填写火山方舟推理接入点 ID 作为模型名

### 3. 启动开发环境

```bash
npm run dev
```

默认启动地址：

```text
http://localhost:3000
```

### 4. 类型检查

```bash
npm run lint
```

### 5. 生产构建

```bash
npm run build
```

### 6. 预览构建结果

```bash
npm run preview
```

## GitHub Pages 部署

项目已适配 GitHub Pages 独立部署，并包含自动发布工作流文件：

```text
.github/workflows/deploy-pages.yml
```

默认行为：

- 推送到 `main` 分支后自动触发构建和发布
- 如果仓库名不是 `yourname.github.io`，构建时会自动使用 `/<仓库名>/` 作为静态资源基础路径
- 如果仓库名是 `yourname.github.io`，则自动使用根路径 `/`

首次启用时请在 GitHub 仓库中完成以下设置：

1. 打开仓库 `Settings`
2. 进入 `Pages`
3. 在 `Build and deployment` 中选择 `Source = GitHub Actions`
4. 确保默认分支为 `main`

如果你后续绑定了自定义域名，或者希望把站点挂在别的子路径下，可以在构建时提供：

```env
VITE_BASE_PATH=/your-custom-path/
```

本地验证生产构建可直接执行：

```bash
npm run build
```

## 使用说明

### 编辑流程

1. 在顶部修改简历标题
2. 在左侧选择“基本信息”维护姓名、职位、联系方式和头像
3. 在左侧模块区新增或排序教育经历、工作经历、项目经历、技能等模块
4. 在右侧面板编辑对应模块的 Markdown 内容
5. 在“全局设置”中调整布局、排版、页边距、主题色和模板
6. 完成后点击顶部“导出 PDF”，通过浏览器打印保存为 PDF

### AI 功能

项目内置三类 AI 能力：

- 模块内容润色：按 STAR 法则优化经历描述
- JD 匹配分析：对比简历与职位描述，输出匹配建议
- 项目描述扩写：根据关键词生成更完整的项目经历

如果 AI 功能没有生效，优先检查：

- 是否已为当前所选厂商配置对应 API Key
- 模型名称和 Base URL 是否填写正确
- 网络环境是否可以访问对应厂商 API
- Key 是否具备对应模型调用权限

## 数据存储

- 编辑数据默认保存在浏览器本地存储中
- 刷新页面后会自动恢复上次内容
- 可通过右侧面板导出为 JSON 备份
- 可重新导入 JSON 恢复或切换不同版本简历

## 项目结构

```text
src/
├─ components/
│  ├─ editor/           # 编辑器工具栏、侧栏、检查面板、画布
│  ├─ layout/           # 页面整体布局
│  └─ resume/           # Markdown 渲染
├─ constants/           # 预设模板
├─ lib/                 # 工具函数、图片裁剪
├─ services/            # AI 服务封装
├─ store/               # Zustand 状态管理
├─ App.tsx
├─ main.tsx
└─ types.ts
```

## 当前核心能力

- 模块化简历编辑
- Markdown 实时预览
- 拖拽排序
- 主题模板
- 头像裁剪
- 二维码展示个人主页
- 分页与单页压缩
- PDF 导出
- JSON 导入导出
- AI 辅助优化

## 注意事项

- PDF 导出依赖浏览器打印能力，建议使用 Chrome 或 Edge
- 强制单页排版开启后，如果内容过长，界面会提示溢出并可尝试智能压缩间距
- 本地存储数据仅保存在当前浏览器中，清理浏览器缓存后会丢失，重要内容请及时导出 JSON 备份

## 后续可扩展方向

- 多份简历管理
- 国际化与中英文双语模板
- 更多预设版式与行业模板
- ATS 友好性检查
- 一键导出图片 / 分享链接
- 后端同步与账号系统
