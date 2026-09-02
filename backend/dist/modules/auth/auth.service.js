"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
const prisma_js_1 = require("../../lib/prisma.js");
const phone_js_1 = require("../../utils/phone.js");
const client_1 = require("@prisma/client");
const env_js_1 = require("../../config/env.js");
class AuthService {
    googleClient;
    constructor() {
        this.googleClient = new google_auth_library_1.OAuth2Client(env_js_1.env.GOOGLE_CLIENT_ID ? env_js_1.env.GOOGLE_CLIENT_ID.trim() : undefined);
    }
    async register(data) {
        const cleanEmail = data.email.trim().toLowerCase();
        const existingUser = await prisma_js_1.prisma.user.findUnique({
            where: { email: cleanEmail },
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
        const isAdminEmail = cleanEmail === env_js_1.env.ADMIN_EMAIL.trim().toLowerCase();
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: data.name.trim(),
                email: cleanEmail,
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
                avatar_url: true,
                subscription_tier: true,
                role: true,
                created_at: true,
            },
        });
        return {
            ...user,
            has_password: true,
        };
    }
    async login(data) {
        const cleanEmail = data.email.trim().toLowerCase();
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (!user) {
            throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
        }
        if (!user.password_hash) {
            throw {
                statusCode: 400,
                message: 'Esta conta foi criada com o Google. Por favor, utilize o botão "Entrar com Google" ou defina uma senha no seu perfil.',
            };
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
            avatar_url: user.avatar_url,
            subscription_tier: user.subscription_tier,
            role: currentRole,
            has_password: true,
        };
    }
    async googleLogin(idToken) {
        let payload;
        const trimmedClientId = env_js_1.env.GOOGLE_CLIENT_ID ? env_js_1.env.GOOGLE_CLIENT_ID.trim() : undefined;
        // Tentativa 1: Verificação criptográfica local via google-auth-library
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: idToken.trim(),
                audience: trimmedClientId,
            });
            payload = ticket.getPayload();
        }
        catch (err) {
            console.warn('⚠️ Falha na verificação local do token Google, verificando via endpoint tokeninfo:', err?.message || err);
            // Tentativa 2: Consulta direta ao endpoint oficial tokeninfo do Google
            try {
                const response = await axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`, { timeout: 8000 });
                if (response.data && response.data.email) {
                    if (trimmedClientId && response.data.aud !== trimmedClientId) {
                        console.error(`Token aud (${response.data.aud}) não coincide com GOOGLE_CLIENT_ID configurado (${trimmedClientId}).`);
                        throw new Error('Token audience mismatch');
                    }
                    payload = response.data;
                }
            }
            catch (fallbackErr) {
                console.error('❌ Erro na validação final do token Google:', fallbackErr?.response?.data || fallbackErr?.message || fallbackErr);
                throw { statusCode: 401, message: 'Token de autenticação do Google inválido ou expirado.' };
            }
        }
        if (!payload || !payload.email) {
            throw { statusCode: 400, message: 'Não foi possível obter os dados do usuário do Google.' };
        }
        const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
        if (!isEmailVerified) {
            throw { statusCode: 400, message: 'O e-mail da sua conta Google não está verificado.' };
        }
        const cleanEmail = payload.email.trim().toLowerCase();
        const googleId = payload.sub || '';
        const name = payload.name || cleanEmail.split('@')[0];
        const avatarUrl = payload.picture || null;
        const isAdminEmail = cleanEmail === env_js_1.env.ADMIN_EMAIL.trim().toLowerCase();
        // Busca usuário existente por google_id ou por email
        let user = await prisma_js_1.prisma.user.findFirst({
            where: {
                OR: [
                    { google_id: googleId },
                    { email: cleanEmail },
                ],
            },
        });
        if (user) {
            // Atualiza google_id, avatar_url ou role se necessário
            const dataToUpdate = {};
            if (!user.google_id) {
                dataToUpdate.google_id = googleId;
            }
            if (!user.avatar_url && avatarUrl) {
                dataToUpdate.avatar_url = avatarUrl;
            }
            if (isAdminEmail && user.role !== client_1.Role.ADMIN) {
                dataToUpdate.role = client_1.Role.ADMIN;
                dataToUpdate.subscription_tier = client_1.SubscriptionTier.PRO;
            }
            if (Object.keys(dataToUpdate).length > 0) {
                user = await prisma_js_1.prisma.user.update({
                    where: { id: user.id },
                    data: dataToUpdate,
                });
            }
        }
        else {
            // Cria novo usuário via Google OAuth
            user = await prisma_js_1.prisma.user.create({
                data: {
                    name,
                    email: cleanEmail,
                    google_id: googleId,
                    avatar_url: avatarUrl,
                    password_hash: null,
                    subscription_tier: client_1.SubscriptionTier.PRO,
                    role: isAdminEmail ? client_1.Role.ADMIN : client_1.Role.USER,
                },
            });
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            avatar_url: user.avatar_url,
            subscription_tier: user.subscription_tier,
            role: user.role,
            has_password: Boolean(user.password_hash),
        };
    }
}
exports.AuthService = AuthService;
