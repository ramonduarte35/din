import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Tenta carregar .env do diretório atual ou das pastas pai (ex: quando executado a partir de backend/)
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    // override: true garante que se o Docker Compose interpolou com $ e passou string vazia "",
    // o valor real lido diretamente do arquivo .env no disco seja preservado
    dotenv.config({ path: envPath, override: true });
    break;
  }
}
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
  ADMIN_EMAIL: z.string().default('admin@din.app'),
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
  // Gateway Asaas (Monetização SaaS Free vs PRO)
  ASAAS_API_KEY: z.string().optional().default(''),
  ASAAS_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  ASAAS_WEBHOOK_TOKEN: z.string().optional().default(''),
  // WhatsApp Cloud API Oficial (Meta for Developers)
  META_WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(''),
  META_WHATSAPP_WABA_ID: z.string().optional().default(''),
  META_WHATSAPP_ACCESS_TOKEN: z.string().optional().default(''),
  META_WHATSAPP_VERIFY_TOKEN: z.string().default('din_meta_verify_token_2026'),
  META_WHATSAPP_APP_SECRET: z.string().optional().default(''),
  APP_URL: z.string().default('http://localhost:8000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Configuração inválida das variáveis de ambiente:', _env.error.format());
  process.exit(1);
}


export const env = _env.data;
process.env.DATABASE_URL = env.DATABASE_URL;

/**
 * Verifica se um e-mail possui privilégio de administrador do sistema.
 * Suporta um único e-mail ou múltiplos e-mails separados por vírgula em ADMIN_EMAIL.
 */
export function isSystemAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const adminList = (env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminList.includes(clean);
}

