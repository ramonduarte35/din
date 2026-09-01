import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionsService } from './transactions.service.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
} from './transactions.schemas.js';

const transactionsService = new TransactionsService();

export class TransactionsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const query = queryTransactionsSchema.parse(request.query);
    const result = await transactionsService.list(userId, query);
    return reply.send(result);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const body = createTransactionSchema.parse(request.body);
    const transaction = await transactionsService.createManual(userId, body);
    return reply.status(201).send({
      message: 'Transação registrada com sucesso!',
      transaction,
    });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const body = updateTransactionSchema.parse(request.body);
    const updated = await transactionsService.update(userId, request.params.id, body);
    return reply.send({
      message: 'Transação atualizada com sucesso!',
      transaction: updated,
    });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const result = await transactionsService.delete(userId, request.params.id);
    return reply.send(result);
  }

  async summary(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const summary = await transactionsService.getSummary(userId);
    return reply.send({ summary });
  }
}
