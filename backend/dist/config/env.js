"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const defaultDbUrl = process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:${process.env.POSTGRES_PORT || '5434'}/${process.env.POSTGRES_DB || 'din'}?schema=public`;
const isProduction = process.env.NODE_ENV === 'production';
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().default(defaultDbUrl),
    REDIS_URL: zod_1.z.string().default('redis://redis:6379'),
    // Em produção, JWT_SECRET deve ser definido explicitamente — sem fallback inseguro
    JWT_SECRET: isProduction
        ? zod_1.z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres em produção')
        : zod_1.z.string().min(8).default('din_jwt_secret_key_default_dev'),
    ADMIN_EMAIL: zod_1.z.string().email().default('admin@din.app'),
    // Em produção, ADMIN_PASSWORD deve ser definida explicitamente (mínimo 6 caracteres)
    ADMIN_PASSWORD: isProduction
        ? zod_1.z.string().min(6, 'ADMIN_PASSWORD deve ter no mínimo 6 caracteres em produção')
        : zod_1.z.string().default('din_admin_password_dev'),
    OPENAI_API_KEY: zod_1.z.string().optional().default(''),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    EVOLUTION_API_URL: zod_1.z.string().default('http://evolution-go:4000'),
    // Em produção, chaves do Evolution devem ser definidas explicitamente
    EVOLUTION_GLOBAL_API_KEY: isProduction
        ? zod_1.z.string().min(16, 'EVOLUTION_GLOBAL_API_KEY deve ser definida em produção')
        : zod_1.z.string().default('din_evolution_global_key_dev'),
    EVOLUTION_WEBHOOK_SECRET: isProduction
        ? zod_1.z.string().min(16, 'EVOLUTION_WEBHOOK_SECRET deve ser definida em produção')
        : zod_1.z.string().default('din_webhook_secret_dev'),
    TELEGRAM_BOT_TOKEN: zod_1.z.string().optional().default(''),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional().default(''),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional().default(''),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Configuração inválida das variáveis de ambiente:', _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
process.env.DATABASE_URL = exports.env.DATABASE_URL;
