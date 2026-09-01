import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // Erros de validação Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Dados enviados são inválidos.',
      issues: error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  // Erros conhecidos do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || ['campo'];
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

  // Erro padrão Fastify com statusCode
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || 'Error',
      message: error.message,
    });
  }

  // Erro interno não tratado
  request.log.error(error);
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'Ocorreu um erro interno no servidor.',
  });
}
