import { FastifyInstance } from 'fastify';
import { TransactionsController } from './transactions.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const transactionsController = new TransactionsController();

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/', transactionsController.list);
  app.post('/', transactionsController.create);
  app.post('/transfer', transactionsController.transfer);
  app.get('/summary', transactionsController.summary);
  app.put('/:id', transactionsController.update);
  app.delete('/:id', transactionsController.delete);
}
