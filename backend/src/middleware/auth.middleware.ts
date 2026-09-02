import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    userPayload?: TokenPayload;
    currentUser?: {
      id: string;
      name: string;
      email: string;
      phone_number: string | null;
      subscription_tier: 'FREE' | 'PRO';
      role: 'USER' | 'ADMIN';
    };
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<TokenPayload>();
    request.userPayload = payload;

    const user = await prisma.user.findUnique({
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
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou ausente.',
    });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  // First ensure user is authenticated
  await authenticate(request, reply);
  if (reply.sent) return;

  const isEmailAdmin = request.currentUser?.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
  const isRoleAdmin = request.currentUser?.role === 'ADMIN';

  if (!isEmailAdmin && !isRoleAdmin) {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Sem permissão. Acesso exclusivo para o administrador do sistema.',
    });
  }
}
