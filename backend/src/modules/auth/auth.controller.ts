import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema, googleAuthSchema } from './auth.schemas.js';
import { env } from '../../config/env.js';

const authService = new AuthService();

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = registerSchema.parse(request.body);
    const user = await authService.register(body);

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
    });

    return reply.status(201).send({
      message: 'Usuário cadastrado com sucesso!',
      user,
      token,
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = loginSchema.parse(request.body);
    const user = await authService.login(body);

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
    });

    return reply.status(200).send({
      message: 'Login realizado com sucesso!',
      user,
      token,
    });
  }

  async googleLogin(request: FastifyRequest, reply: FastifyReply) {
    const body = googleAuthSchema.parse(request.body);
    const user = await authService.googleLogin(body.idToken);

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
    });

    return reply.status(200).send({
      message: 'Login com Google realizado com sucesso!',
      user,
      token,
    });
  }

  async getConfig(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      googleClientId: env.GOOGLE_CLIENT_ID || '',
    });
  }
}


