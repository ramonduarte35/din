"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
function errorHandler(error, request, reply) {
    // Erros de validação Zod
    if (error instanceof zod_1.ZodError) {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Validation Error',
            message: error.issues[0]?.message || 'Dados enviados são inválidos.',
            issues: error.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
            })),
        });
    }
    // Erros conhecidos do Prisma
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || ['campo'];
            return reply.status(409).send({
                statusCode: 409,
                error: 'Conflict',
                message: `Já existe um registro com este ${target.join(', ')}.`,
            });
        }
        if (error.code === 'P2025') {
            return reply.status(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: 'Registro não encontrado no banco de dados.',
            });
        }
    }
    // Erro padrão Fastify ou objeto com statusCode
    if (error?.statusCode) {
        const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 400;
        return reply.status(statusCode).send({
            statusCode,
            error: error.error || error.name || 'Error',
            message: error.message || 'Ocorreu um erro na requisição.',
        });
    }
    // Erro interno não tratado
    request.log.error(error);
    console.error('❌ Erro não tratado:', error);
    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error?.message || 'Ocorreu um erro interno no servidor.',
    });
}
