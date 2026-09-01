"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../../lib/prisma.js");
const phone_js_1 = require("../../utils/phone.js");
const client_1 = require("@prisma/client");
class AuthService {
    async register(data) {
        const existingUser = await prisma_js_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw { statusCode: 409, message: 'E-mail já cadastrado na plataforma.' };
        }
        let normalizedPhone = null;
        if (data.phone_number) {
            normalizedPhone = (0, phone_js_1.normalizePhoneNumber)(data.phone_number);
            const existingPhone = await prisma_js_1.prisma.user.findUnique({
                where: { phone_number: normalizedPhone },
            });
            if (existingPhone) {
                throw { statusCode: 409, message: 'Número de WhatsApp já vinculado a outra conta.' };
            }
        }
        const password_hash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password_hash,
                phone_number: normalizedPhone,
                subscription_tier: client_1.SubscriptionTier.PRO, // Concede Pro por padrão no cadastro para melhor experiência de teste
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                subscription_tier: true,
                role: true,
                created_at: true,
            },
        });
        return user;
    }
    async login(data) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
        }
        const passwordMatch = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!passwordMatch) {
            throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            subscription_tier: user.subscription_tier,
            role: user.role,
        };
    }
}
exports.AuthService = AuthService;
