import { FastifyInstance } from 'fastify';
import { subscriptionsController } from './subscriptions.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function subscriptionsRoutes(app: FastifyInstance) {
  // Planos disponíveis (público / autenticado)
  app.get('/plans', subscriptionsController.getPlans);

  // Rotas autenticadas do usuário
  app.register(async (authGroup) => {
    authGroup.addHook('preHandler', authenticate);

    authGroup.get('/my-subscription', subscriptionsController.getMySubscription);
    authGroup.post('/checkout', subscriptionsController.createCheckout);
  });
}
