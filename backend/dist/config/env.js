"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL é obrigatória'),
    REDIS_URL: zod_1.z.string().default('redis://redis:6379'),
    JWT_SECRET: zod_1.z.string().min(8, 'JWT_SECRET deve ter no mínimo 8 caracteres'),
    OPENAI_API_KEY: zod_1.z.string().optional().default(''),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    EVOLUTION_API_URL: zod_1.z.string().default('http://evolution-go:4000'),
    EVOLUTION_GLOBAL_API_KEY: zod_1.z.string().default('din_evolution_global_key_2026'),
    EVOLUTION_WEBHOOK_SECRET: zod_1.z.string().default('din_webhook_secret_2026'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Configuração inválida das variáveis de ambiente:', _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
