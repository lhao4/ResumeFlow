import { GoogleGenAI } from '@google/genai';
import { AI_PROVIDER_PRESETS } from '../constants/aiProviders';
import { AIConfig, AIProvider } from '../types';
import { useResumeStore } from '../store/useResumeStore';

type ResolvedAIConfig = AIConfig & {
  label: string;
  protocol: 'gemini' | 'anthropic' | 'openai-compatible';
};

const ENV_API_KEYS: Record<AIProvider, string> = {
  gemini: process.env.GEMINI_API_KEY || '',
  openai: process.env.OPENAI_API_KEY || '',
  claude: process.env.ANTHROPIC_API_KEY || '',
  kimi: process.env.KIMI_API_KEY || '',
  doubao: process.env.DOUBAO_API_KEY || '',
  glm: process.env.GLM_API_KEY || '',
  qwen: process.env.QWEN_API_KEY || '',
  deepseek: process.env.DEEPSEEK_API_KEY || '',
};

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');

const getResolvedAIConfig = (): ResolvedAIConfig => {
  const { aiConfig } = useResumeStore.getState();
  const provider = aiConfig?.provider || 'gemini';
  const preset = AI_PROVIDER_PRESETS[provider];

  return {
    provider,
    label: preset.label,
    protocol: preset.protocol,
    model: aiConfig?.model?.trim() || preset.defaultModel,
    baseUrl: aiConfig?.baseUrl?.trim() || preset.defaultBaseUrl,
    apiKey: aiConfig?.apiKey?.trim() || ENV_API_KEYS[provider],
  };
};

const ensureConfig = (config: ResolvedAIConfig) => {
  if (!config.apiKey) {
    throw new Error(`${config.label} API Key 未配置。请在右侧 API 设置中填写，或配置对应环境变量。`);
  }

  if (!config.model) {
    throw new Error(`${config.label} 模型名称未配置。请在右侧 API 设置中填写模型名。`);
  }
};

const parseErrorResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const data = JSON.parse(text);
    return (
      data?.error?.message ||
      data?.message ||
      data?.detail ||
      `${response.status} ${response.statusText}`
    );
  } catch {
    return text;
  }
};

const extractOpenAICompatibleText = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object' && 'text' in item && typeof item.text === 'string') {
          return item.text;
        }

        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
};

const callGemini = async (config: ResolvedAIConfig, systemInstruction: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const response = await ai.models.generateContent({
    model: config.model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text || '';
};

const callOpenAICompatible = async (config: ResolvedAIConfig, systemInstruction: string, prompt: string) => {
  const baseUrl = normalizeUrl(config.baseUrl);
  if (!baseUrl) {
    throw new Error(`${config.label} Base URL 未配置。`);
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await parseErrorResponse(response);
    throw new Error(`${config.label} 请求失败：${detail}`);
  }

  const data = await response.json();
  return extractOpenAICompatibleText(data?.choices?.[0]?.message?.content);
};

const callClaude = async (config: ResolvedAIConfig, systemInstruction: string, prompt: string) => {
  const endpoint = config.baseUrl.trim() || AI_PROVIDER_PRESETS.claude.defaultBaseUrl;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1200,
      system: systemInstruction,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const detail = await parseErrorResponse(response);
    throw new Error(`${config.label} 请求失败：${detail}`);
  }

  const data = await response.json();
  return (
    data?.content
      ?.filter((item: { type?: string }) => item?.type === 'text')
      .map((item: { text?: string }) => item?.text || '')
      .join('\n')
      .trim() || ''
  );
};

const runAITextTask = async (systemInstruction: string, prompt: string) => {
  const config = getResolvedAIConfig();
  ensureConfig(config);

  switch (config.protocol) {
    case 'gemini':
      return callGemini(config, systemInstruction, prompt);
    case 'anthropic':
      return callClaude(config, systemInstruction, prompt);
    case 'openai-compatible':
      return callOpenAICompatible(config, systemInstruction, prompt);
  }

  const unsupportedProtocol: never = config.protocol;
  throw new Error(`暂不支持的 AI 协议：${unsupportedProtocol}`);
};

const withFallback = async (task: () => Promise<string>, fallback: string, label: string) => {
  try {
    const result = await task();
    return result || fallback;
  } catch (error) {
    console.error(`${label} Error:`, error);
    return error instanceof Error ? `${fallback}\n\n> ${error.message}` : fallback;
  }
};

export const polishContent = async (content: string, type: 'experience' | 'project' | 'summary') => {
  const sceneMap = {
    experience: '工作经历',
    project: '项目经历',
    summary: '自我评价',
  } as const;

  const systemInstruction = `你是一个专业的简历优化专家。你的任务是将用户的简历内容改写得更具竞争力和专业性。
对于工作经历和项目经历，请严格遵循 STAR 法则（Situation 情境, Task 任务, Action 行动, Result 结果）。
使用强有力的动词，突出量化成果（如：提升了 40% 效率，节省了 100 万成本）。
保持语言简洁、专业、大厂风格。
返回的内容应该是纯 Markdown 格式。`;

  const prompt = `请优化以下${sceneMap[type]}内容：\n\n${content}`;

  return withFallback(
    () => runAITextTask(systemInstruction, prompt),
    content,
    'AI Polish'
  );
};

export const analyzeJD = async (resumeContent: string, jdText: string) => {
  const systemInstruction = `你是一个资深 HR 和猎头。你的任务是分析用户的简历与职位描述（JD）的匹配度。
请提供以下方面的分析：
1. 匹配得分（0-100）。
2. 核心优势：简历中哪些点非常符合 JD。
3. 缺失技能/关键词：JD 中要求但简历中未体现的点。
4. 修改建议：如何调整简历以更好地匹配该职位。
请使用 Markdown 格式返回。`;

  const prompt = `简历内容：\n${resumeContent}\n\n职位描述：\n${jdText}`;

  return withFallback(
    () => runAITextTask(systemInstruction, prompt),
    '分析过程中出现错误。',
    'AI JD Analysis'
  );
};

export const expandProject = async (keywords: string) => {
  const systemInstruction = `你是一个技术专家。用户会提供一些关于项目的关键词或简短描述，请你将其扩写成一段完整的、专业的简历项目描述。
包含：项目背景、核心技术栈、你的具体职责、攻克的难点以及最终成果。
使用 Markdown 列表格式。
保持专业、大厂风格。`;

  const prompt = `关键词：${keywords}`;

  return withFallback(
    () => runAITextTask(systemInstruction, prompt),
    '扩写过程中出现错误。',
    'AI Project Expansion'
  );
};
