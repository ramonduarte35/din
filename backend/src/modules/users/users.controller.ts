import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service.js';
import { updateProfileSchema } from './users.schemas.js';

const usersService = new UsersService();

export class UsersController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const profile = await usersService.getProfile(userId);
    return reply.send({ user: profile });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const body = updateProfileSchema.parse(request.body);
    const updated = await usersService.updateProfile(userId, body);
    return reply.send({
      message: 'Perfil atualizado com sucesso!',
      user: updated,
    });
  }
}
