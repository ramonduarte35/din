import { FastifyInstance } from 'fastify';
import { BudgetsController } from './budgets.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const budgetsController = new BudgetsController();

export async function budgetsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/', budgetsController.list);
  app.post('/', budgetsController.upsert);
  app.post('/copy-previous', budgetsController.copyPrevious);
  app.put('/:id', budgetsController.update);
  app.delete('/:id', budgetsController.delete);
}
