import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  REDIS_URL: z.string().default('redis://redis:6379'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET deve ter no mínimo 8 caracteres'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  EVOLUTION_API_URL: z.string().default('http://evolution-go:8080'),
  EVOLUTION_GLOBAL_API_KEY: z.string().default('din_evolution_global_key_2026'),
  EVOLUTION_WEBHOOK_SECRET: z.string().default('din_webhook_secret_2026'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Configuração inválida das variáveis de ambiente:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
