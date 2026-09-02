import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const defaultDbUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:${process.env.POSTGRES_PORT || '5434'}/${process.env.POSTGRES_DB || 'din'}?schema=public`;

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default(defaultDbUrl),
  REDIS_URL: z.string().default('redis://redis:6379'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET deve ter no mínimo 8 caracteres').default('din_jwt_secret_key_default_2026'),
  ADMIN_EMAIL: z.string().email().default('admin@din.app'),
  ADMIN_PASSWORD: z.string().default('din_admin_password_2026'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  EVOLUTION_API_URL: z.string().default('http://evolution-go:4000'),
  EVOLUTION_GLOBAL_API_KEY: z.string().default('din_evolution_global_key_2026'),
  EVOLUTION_WEBHOOK_SECRET: z.string().default('din_webhook_secret_2026'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Configuração inválida das variáveis de ambiente:', _env.error.format());
  process.exit(1);
}


export const env = _env.data;
process.env.DATABASE_URL = env.DATABASE_URL;

