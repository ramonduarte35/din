import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { env, isSystemAdminEmail } from '../config/env.js';

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
        theme: true,
      },
    });

    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Usuário não encontrado ou sessão expirada.',
      });
    }

    // Se o e-mail estiver configurado como administrador no .env, garante privilégios instantâneos.
    // O UPDATE só ocorre se os dados no banco estiverem de fato desatualizados (evita write a cada request).
    if (isSystemAdminEmail(user.email) && (user.role !== 'ADMIN' || user.subscription_tier !== 'PRO')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN', subscription_tier: 'PRO' },
      });
      user.role = 'ADMIN';
      user.subscription_tier = 'PRO';
    }

    request.currentUser = user;
    (request as any).user = {
      id: user.id,
      userId: user.id,
      email: user.email,
    };
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou ausente.',
    });
  }
}

export function getUserId(request: FastifyRequest): string {
  const id =
    request.currentUser?.id ||
    request.userPayload?.userId ||
    (request.user as any)?.userId ||
    (request.user as any)?.id;

  if (!id) {
    throw { statusCode: 401, message: 'Usuário não autenticado.' };
  }
  return id;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  // First ensure user is authenticated
  await authenticate(request, reply);
  if (reply.sent) return;

  const isEmailAdmin = isSystemAdminEmail(request.currentUser?.email);
  const isRoleAdmin = request.currentUser?.role === 'ADMIN';

  if (!isEmailAdmin && !isRoleAdmin) {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Sem permissão. Acesso exclusivo para o administrador do sistema.',
    });
  }
}
