import { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const usersController = new UsersController();

export async function usersRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: [authenticate] }, usersController.getProfile);
  app.put('/profile', { preHandler: [authenticate] }, usersController.updateProfile);
}
