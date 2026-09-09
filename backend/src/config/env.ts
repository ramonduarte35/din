import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const defaultDbUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:${process.env.POSTGRES_PORT || '5434'}/${process.env.POSTGRES_DB || 'din'}?schema=public`;

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default(defaultDbUrl),
  REDIS_URL: z.string().default('redis://redis:6379'),
  // Em produção, JWT_SECRET deve ser definido explicitamente — sem fallback inseguro
  JWT_SECRET: isProduction
    ? z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres em produção')
    : z.string().min(8).default('din_jwt_secret_key_default_dev'),
  ADMIN_EMAIL: z.string().email().default('admin@din.app'),
  // Em produção, ADMIN_PASSWORD deve ser definida explicitamente (mínimo 6 caracteres)
  ADMIN_PASSWORD: isProduction
    ? z.string().min(6, 'ADMIN_PASSWORD deve ter no mínimo 6 caracteres em produção')
    : z.string().default('din_admin_password_dev'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  EVOLUTION_API_URL: z.string().default('http://evolution-go:4000'),
  // Em produção, chaves do Evolution devem ser definidas explicitamente
  EVOLUTION_GLOBAL_API_KEY: isProduction
    ? z.string().min(16, 'EVOLUTION_GLOBAL_API_KEY deve ser definida em produção')
    : z.string().default('din_evolution_global_key_dev'),
  EVOLUTION_WEBHOOK_SECRET: isProduction
    ? z.string().min(16, 'EVOLUTION_WEBHOOK_SECRET deve ser definida em produção')
    : z.string().default('din_webhook_secret_dev'),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Configuração inválida das variáveis de ambiente:', _env.error.format());
  process.exit(1);
}


export const env = _env.data;
process.env.DATABASE_URL = env.DATABASE_URL;

