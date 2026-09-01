"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
const prisma_js_1 = require("../lib/prisma.js");
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
    }
    catch (err) {
        return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Token de autenticação inválido ou ausente.',
        });
    }
}
async function requireAdmin(request, reply) {
    // First ensure user is authenticated
    await authenticate(request, reply);
    if (reply.sent)
        return;
    if (request.currentUser?.role !== 'ADMIN') {
        return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Acesso restrito para administradores do sistema.',
        });
    }
}
