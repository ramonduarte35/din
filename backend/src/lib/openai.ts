import OpenAI from 'openai';
import { env } from '../config/env.js';

export const openai = env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export const hasOpenAIConfigured = (): boolean => {
  return openai !== null;
};
