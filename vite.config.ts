import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const normalizeBasePath = (value: string) => {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
  const isUserOrOrgSite = repositoryName.endsWith('.github.io');
  const inferredGithubPagesBase =
    process.env.GITHUB_ACTIONS === 'true' && repositoryName && !isUserOrOrgSite
      ? `/${repositoryName}/`
      : '/';
  const base = normalizeBasePath(env.VITE_BASE_PATH || inferredGithubPagesBase);

  return {
    plugins: [react(), tailwindcss()],
    base,
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || ''),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY || ''),
      'process.env.KIMI_API_KEY': JSON.stringify(env.KIMI_API_KEY || ''),
      'process.env.DOUBAO_API_KEY': JSON.stringify(env.DOUBAO_API_KEY || ''),
      'process.env.GLM_API_KEY': JSON.stringify(env.GLM_API_KEY || ''),
      'process.env.QWEN_API_KEY': JSON.stringify(env.QWEN_API_KEY || ''),
      'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
