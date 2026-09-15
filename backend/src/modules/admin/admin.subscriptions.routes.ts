import { FastifyInstance } from 'fastify';
import { adminSubscriptionsController } from './admin.subscriptions.controller.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';

export async function adminSubscriptionsRoutes(app: FastifyInstance) {
  // Todas as rotas administrativas requerem autenticação e Role ADMIN
  app.addHook('preHandler', requireAdmin);

  // Visão geral executiva e métricas (MRR, total usuários, etc.)
  app.get('/overview', adminSubscriptionsController.getOverview);

  // Listagem e busca de usuários com planos
  app.get('/users', adminSubscriptionsController.getUsers);

  // Gestão manual do plano de um usuário
  app.post('/users/:id/manage', adminSubscriptionsController.manageUserSubscription);

  // Histórico de pagamentos e cobranças do Asaas
  app.get('/payments', adminSubscriptionsController.getPayments);
}
