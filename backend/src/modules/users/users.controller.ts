import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service.js';
import { updateProfileSchema, changePasswordSchema } from './users.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const usersService = new UsersService();

export class UsersController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const profile = await usersService.getProfile(userId);
    return reply.send({ user: profile });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = updateProfileSchema.parse(request.body);
    const updated = await usersService.updateProfile(userId, body);
    return reply.send({
      message: 'Perfil atualizado com sucesso!',
      user: updated,
    });
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = changePasswordSchema.parse(request.body);
    const result = await usersService.changePassword(userId, body);
    return reply.send(result);
  }

  async generateTelegramLinkCode(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const result = await usersService.generateTelegramLinkCode(userId);
    return reply.send(result);
  }

  async unlinkTelegram(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const result = await usersService.unlinkTelegram(userId);
    return reply.send(result);
  }
}

