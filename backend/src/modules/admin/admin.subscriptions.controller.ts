import { FastifyRequest, FastifyReply } from 'fastify';
import { adminSubscriptionsService } from './admin.subscriptions.service.js';
import {
  manageUserSubscriptionSchema,
  queryUsersSubscriptionSchema,
} from './admin.subscriptions.schemas.js';

export class AdminSubscriptionsController {
  async getOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await adminSubscriptionsService.getOverview();
      return reply.send(data);
    } catch (err: any) {
      request.log.error(err, 'Erro ao buscar overview de assinaturas');
      return reply.status(500).send({ error: err.message || 'Erro ao carregar dados' });
    }
  }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = queryUsersSubscriptionSchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Parâmetros de busca inválidos',
          details: parsed.error.format(),
        });
      }

      const data = await adminSubscriptionsService.getUsers(parsed.data);
      return reply.send(data);
    } catch (err: any) {
      request.log.error(err, 'Erro ao buscar usuários de assinaturas');
      return reply.status(500).send({ error: err.message || 'Erro ao listar usuários' });
    }
  }

  async manageUserSubscription(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id: targetUserId } = request.params;
      const adminUser = request.user as { id: string };

      const parsed = manageUserSubscriptionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados de gerenciamento inválidos',
          details: parsed.error.format(),
        });
      }

      const updated = await adminSubscriptionsService.manageUserSubscription(
        targetUserId,
        parsed.data,
        adminUser.id
      );

      return reply.send({
        success: true,
        message: 'Plano do usuário atualizado com sucesso',
        user: updated,
      });
    } catch (err: any) {
      request.log.error(err, 'Erro ao gerenciar assinatura do usuário');
      return reply.status(500).send({ error: err.message || 'Erro ao atualizar plano' });
    }
  }

  async getPayments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { page?: string; limit?: string; status?: string };
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 20;
      const status = query.status;

      const data = await adminSubscriptionsService.getPayments(page, limit, status);
      return reply.send(data);
    } catch (err: any) {
      request.log.error(err, 'Erro ao buscar histórico de pagamentos Asaas');
      return reply.status(500).send({ error: err.message || 'Erro ao listar pagamentos' });
    }
  }
}

export const adminSubscriptionsController = new AdminSubscriptionsController();
