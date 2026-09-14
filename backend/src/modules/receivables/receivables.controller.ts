import { FastifyRequest, FastifyReply } from 'fastify';
import { ReceivablesService } from './receivables.service.js';
import {
  createReceivableSchema,
  updateReceivableSchema,
  receiveReceivableSchema,
  listReceivablesQuerySchema,
} from './receivables.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const receivablesService = new ReceivablesService();

export class ReceivablesController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const data = createReceivableSchema.parse(request.body);
      const receivable = await receivablesService.createReceivable(userId, data);
      return reply.status(201).send(receivable);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao criar conta a receber' });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const query = listReceivablesQuerySchema.parse(request.query);
      const result = await receivablesService.listReceivables(userId, query);
      return reply.send(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Parâmetros inválidos' });
      }
      return reply.status(500).send({ message: 'Erro ao listar contas a receber' });
    }
  }

  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { month, year } = request.query as { month?: string; year?: string };
      const summary = await receivablesService.getReceivableSummary(
        userId,
        month ? parseInt(month, 10) : undefined,
        year ? parseInt(year, 10) : undefined
      );
      return reply.send(summary);
    } catch (error: any) {
      return reply.status(500).send({ message: 'Erro ao obter resumo de contas a receber' });
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const receivable = await receivablesService.getReceivableById(userId, id);
      return reply.send(receivable);
    } catch (error: any) {
      return reply.status(404).send({ message: error.message || 'Conta a receber não encontrada' });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const data = updateReceivableSchema.parse(request.body);
      const updated = await receivablesService.updateReceivable(userId, id, data);
      return reply.send(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao atualizar conta a receber' });
    }
  }

  async receive(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const data = receiveReceivableSchema.parse(request.body);
      const result = await receivablesService.receiveReceivable(userId, id, data);
      return reply.send(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao registrar recebimento' });
    }
  }

  async unreceive(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const result = await receivablesService.unreceiveReceivable(userId, id);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || 'Erro ao desfazer recebimento' });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string }; Querystring: { scope?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const scope = (request.query as any).scope === 'ALL' ? 'ALL' : 'SINGLE';
      const result = await receivablesService.deleteReceivable(userId, id, scope);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || 'Erro ao excluir conta a receber' });
    }
  }
}
