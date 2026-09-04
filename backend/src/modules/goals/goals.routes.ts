import { FastifyInstance } from 'fastify';
import { GoalsController } from './goals.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const goalsController = new GoalsController();

export async function goalsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/', goalsController.list);
  app.post('/', goalsController.create);
  app.put('/:id', goalsController.update);
  app.post('/:id/deposit', goalsController.deposit);
  app.delete('/:id', goalsController.delete);
}
