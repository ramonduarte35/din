import { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const usersController = new UsersController();

export async function usersRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: [authenticate] }, usersController.getProfile);
  app.put('/profile', { preHandler: [authenticate] }, usersController.updateProfile);
  app.post('/change-password', { preHandler: [authenticate] }, usersController.changePassword);
  app.post('/telegram/link-code', { preHandler: [authenticate] }, usersController.generateTelegramLinkCode);
  app.post('/telegram/unlink', { preHandler: [authenticate] }, usersController.unlinkTelegram);
}

