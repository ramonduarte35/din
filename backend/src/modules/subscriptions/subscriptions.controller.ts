import { FastifyRequest, FastifyReply } from 'fastify';
import { subscriptionsService } from './subscriptions.service.js';
import { checkoutSchema } from './subscriptions.schemas.js';

export class SubscriptionsController {
  async getMySubscription(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as { id: string };
      const data = await subscriptionsService.getMySubscription(user.id);
      return reply.send(data);
    } catch (err: any) {
      request.log.error(err, 'Erro ao buscar assinatura do usuário');
      return reply.status(500).send({ error: err.message || 'Erro ao carregar dados da assinatura' });
    }
  }

  async getPlans(_request: FastifyRequest, reply: FastifyReply) {
    const plans = subscriptionsService.getAvailablePlans();
    return reply.send({ plans });
  }

  async createCheckout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as { id: string };
      const parsed = checkoutSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados de checkout inválidos',
          details: parsed.error.format(),
        });
      }

      const result = await subscriptionsService.createCheckout(user.id, parsed.data);
      return reply.status(201).send(result);
    } catch (err: any) {
      request.log.error(err, 'Erro ao gerar checkout Asaas');
      return reply.status(500).send({ error: err.message || 'Erro ao gerar cobrança' });
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
