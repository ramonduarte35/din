"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.getUserId = getUserId;
exports.requireAdmin = requireAdmin;
const prisma_js_1 = require("../lib/prisma.js");
const env_js_1 = require("../config/env.js");
async function authenticate(request, reply) {
    try {
        const payload = await request.jwtVerify();
        request.userPayload = payload;
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                subscription_tier: true,
                role: true,
            },
        });
        if (!user) {
            return reply.status(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Usuário não encontrado ou sessão expirada.',
            });
        }
        request.currentUser = user;
        request.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
        };
    }
    catch (err) {
        return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Token de autenticação inválido ou ausente.',
        });
    }
}
function getUserId(request) {
    const id = request.currentUser?.id ||
        request.userPayload?.userId ||
        request.user?.userId ||
        request.user?.id;
    if (!id) {
        throw { statusCode: 401, message: 'Usuário não autenticado.' };
    }
    return id;
}
async function requireAdmin(request, reply) {
    // First ensure user is authenticated
    await authenticate(request, reply);
    if (reply.sent)
        return;
    const isEmailAdmin = request.currentUser?.email.toLowerCase() === env_js_1.env.ADMIN_EMAIL.toLowerCase();
    const isRoleAdmin = request.currentUser?.role === 'ADMIN';
    if (!isEmailAdmin && !isRoleAdmin) {
        return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Sem permissão. Acesso exclusivo para o administrador do sistema.',
        });
    }
}
