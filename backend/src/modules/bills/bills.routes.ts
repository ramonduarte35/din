import { FastifyInstance } from 'fastify';
import { BillsController } from './bills.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const controller = new BillsController();

export async function billsRoutes(app: FastifyInstance) {
  // Todas as rotas de contas a pagar exigem autenticação do usuário
  app.addHook('onRequest', authenticate);

  app.post('/', controller.create.bind(controller));
  app.get('/', controller.list.bind(controller));
  app.get('/summary', controller.getSummary.bind(controller));
  app.post('/notify-due', controller.notifyDue.bind(controller));
  app.post('/admin/notify-all', { preHandler: [requireAdmin] }, controller.adminNotifyAll.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
  app.post('/:id/pay', controller.pay.bind(controller));
  app.post('/:id/unpay', controller.unpay.bind(controller));
}

