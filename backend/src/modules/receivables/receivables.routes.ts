import { FastifyInstance } from 'fastify';
import { ReceivablesController } from './receivables.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const controller = new ReceivablesController();

export async function receivablesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate);

  app.post('/', controller.create.bind(controller));
  app.get('/', controller.list.bind(controller));
  app.get('/summary', controller.getSummary.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
  app.post('/:id/receive', controller.receive.bind(controller));
  app.post('/:id/unreceive', controller.unreceive.bind(controller));
}
