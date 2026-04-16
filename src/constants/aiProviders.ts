import { AIProtocol, AIProvider } from '../types';

export type AIProviderPreset = {
  label: string;
  protocol: AIProtocol;
  defaultModel: string;
  defaultBaseUrl: string;
  apiKeyEnvVar: string;
  description: string;
  modelPlaceholder?: string;
  baseUrlPlaceholder?: string;
};

export const AI_PROVIDER_PRESETS: Record<AIProvider, AIProviderPreset> = {
  gemini: {
    label: 'Gemini',
    protocol: 'gemini',
    defaultModel: 'gemini-2.5-flash',
    defaultBaseUrl: '',
    apiKeyEnvVar: 'GEMINI_API_KEY',
    description: 'Google Gemini 原生接口，通过 SDK 直接调用。',
    modelPlaceholder: 'gemini-2.5-flash',
  },
  openai: {
    label: 'ChatGPT / OpenAI',
    protocol: 'openai-compatible',
    defaultModel: 'gpt-4.1-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    description: 'OpenAI 官方接口，使用 Chat Completions 兼容格式。',
    modelPlaceholder: 'gpt-4.1-mini',
    baseUrlPlaceholder: 'https://api.openai.com/v1',
  },
  claude: {
    label: 'Claude',
    protocol: 'anthropic',
    defaultModel: 'claude-3-5-sonnet-latest',
    defaultBaseUrl: 'https://api.anthropic.com/v1/messages',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    description: 'Anthropic Messages API。浏览器直连时会附带浏览器访问确认头。',
    modelPlaceholder: 'claude-3-5-sonnet-latest',
    baseUrlPlaceholder: 'https://api.anthropic.com/v1/messages',
  },
  kimi: {
    label: 'Kimi',
    protocol: 'openai-compatible',
    defaultModel: 'moonshot-v1-8k',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    apiKeyEnvVar: 'KIMI_API_KEY',
    description: 'Moonshot AI 的 OpenAI 兼容接口。',
    modelPlaceholder: 'moonshot-v1-8k',
    baseUrlPlaceholder: 'https://api.moonshot.cn/v1',
  },
  doubao: {
    label: '豆包',
    protocol: 'openai-compatible',
    defaultModel: '',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKeyEnvVar: 'DOUBAO_API_KEY',
    description: '火山方舟兼容接口。通常需要填写您自己的推理接入点 ID 作为模型名。',
    modelPlaceholder: 'ep-xxxxxxxxxxxxxxxx',
    baseUrlPlaceholder: 'https://ark.cn-beijing.volces.com/api/v3',
  },
  glm: {
    label: 'GLM',
    protocol: 'openai-compatible',
    defaultModel: 'glm-4-flash',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyEnvVar: 'GLM_API_KEY',
    description: '智谱 GLM 的 OpenAI 兼容接口。',
    modelPlaceholder: 'glm-4-flash',
    baseUrlPlaceholder: 'https://open.bigmodel.cn/api/paas/v4',
  },
  qwen: {
    label: '千问',
    protocol: 'openai-compatible',
    defaultModel: 'qwen-plus',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKeyEnvVar: 'QWEN_API_KEY',
    description: '阿里云百炼兼容接口。',
    modelPlaceholder: 'qwen-plus',
    baseUrlPlaceholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  deepseek: {
    label: 'DeepSeek',
    protocol: 'openai-compatible',
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    description: 'DeepSeek 官方兼容接口。',
    modelPlaceholder: 'deepseek-chat',
    baseUrlPlaceholder: 'https://api.deepseek.com/v1',
  },
};
