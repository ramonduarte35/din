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
const env_js_1 = require("../../config/env.js");
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
        const isAdminEmail = data.email.trim().toLowerCase() === env_js_1.env.ADMIN_EMAIL.trim().toLowerCase();
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email.trim().toLowerCase(),
                password_hash,
                phone_number: normalizedPhone,
                subscription_tier: client_1.SubscriptionTier.PRO,
                role: isAdminEmail ? client_1.Role.ADMIN : client_1.Role.USER,
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
        const cleanEmail = data.email.trim().toLowerCase();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (!user) {
            throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
        }
        const passwordMatch = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!passwordMatch) {
            throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
        }
        // Se o email coincide com o ADMIN_EMAIL do .env mas o role ainda não era ADMIN, atualiza automaticamente
        let currentRole = user.role;
        if (cleanEmail === env_js_1.env.ADMIN_EMAIL.trim().toLowerCase() && currentRole !== client_1.Role.ADMIN) {
            await prisma_js_1.prisma.user.update({
                where: { id: user.id },
                data: { role: client_1.Role.ADMIN, subscription_tier: client_1.SubscriptionTier.PRO },
            });
            currentRole = client_1.Role.ADMIN;
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            subscription_tier: user.subscription_tier,
            role: currentRole,
        };
    }
}
exports.AuthService = AuthService;
