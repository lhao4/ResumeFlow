import { GoogleGenAI } from "@google/genai";
import { useResumeStore } from "../store/useResumeStore";

const getAI = () => {
  const userKey = useResumeStore.getState().apiKey;
  const apiKey = userKey || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const polishContent = async (content: string, type: 'experience' | 'project' | 'summary') => {
  const ai = getAI();
  const systemInstruction = `你是一个专业的简历优化专家。你的任务是将用户的简历内容改写得更具竞争力和专业性。
  对于工作经历和项目经历，请严格遵循 STAR 法则（Situation 情境, Task 任务, Action 行动, Result 结果）。
  使用强有力的动词，突出量化成果（如：提升了 40% 效率，节省了 100 万成本）。
  保持语言简洁、专业、大厂风格。
  返回的内容应该是纯 Markdown 格式。`;

  const prompt = `请优化以下内容：\n\n${content}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text || content;
  } catch (error) {
    console.error("AI Polish Error:", error);
    return content;
  }
};

export const analyzeJD = async (resumeContent: string, jdText: string) => {
  const ai = getAI();
  const systemInstruction = `你是一个资深 HR 和猎头。你的任务是分析用户的简历与职位描述（JD）的匹配度。
  请提供以下方面的分析：
  1. 匹配得分（0-100）。
  2. 核心优势：简历中哪些点非常符合 JD。
  3. 缺失技能/关键词：JD 中要求但简历中未体现的点。
  4. 修改建议：如何调整简历以更好地匹配该职位。
  请使用 Markdown 格式返回。`;

  const prompt = `简历内容：\n${resumeContent}\n\n职位描述：\n${jdText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text || "分析失败，请稍后重试。";
  } catch (error) {
    console.error("AI JD Analysis Error:", error);
    return "分析过程中出现错误。";
  }
};

export const expandProject = async (keywords: string) => {
  const ai = getAI();
  const systemInstruction = `你是一个技术专家。用户会提供一些关于项目的关键词或简短描述，请你将其扩写成一段完整的、专业的简历项目描述。
  包含：项目背景、核心技术栈、你的具体职责、攻克的难点以及最终成果。
  使用 Markdown 列表格式。
  保持专业、大厂风格。`;

  const prompt = `关键词：${keywords}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text || "扩写失败。";
  } catch (error) {
    console.error("AI Project Expansion Error:", error);
    return "扩写过程中出现错误。";
  }
};
