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
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().default(defaultDbUrl),
    REDIS_URL: zod_1.z.string().default('redis://redis:6379'),
    JWT_SECRET: zod_1.z.string().min(8, 'JWT_SECRET deve ter no mínimo 8 caracteres').default('din_jwt_secret_key_default_2026'),
    ADMIN_EMAIL: zod_1.z.string().email().default('admin@din.app'),
    ADMIN_PASSWORD: zod_1.z.string().default('din_admin_password_2026'),
    OPENAI_API_KEY: zod_1.z.string().optional().default(''),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    EVOLUTION_API_URL: zod_1.z.string().default('http://evolution-go:4000'),
    EVOLUTION_GLOBAL_API_KEY: zod_1.z.string().default('din_evolution_global_key_2026'),
    EVOLUTION_WEBHOOK_SECRET: zod_1.z.string().default('din_webhook_secret_2026'),
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
