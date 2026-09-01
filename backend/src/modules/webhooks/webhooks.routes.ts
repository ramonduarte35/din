import { FastifyInstance } from 'fastify';
import { WebhooksController } from './webhooks.controller.js';

const webhooksController = new WebhooksController();

export async function webhooksRoutes(app: FastifyInstance) {
  // Webhook principal do Evolution Go (POST /api/v1/webhooks/evolution)
  app.post('/evolution', webhooksController.handleEvolutionWebhook);

  // Endpoint de simulação para desenvolvimento e testes rápidos
  app.post('/simulate', webhooksController.simulateWhatsAppMessage);
}
