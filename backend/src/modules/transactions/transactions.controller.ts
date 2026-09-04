import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionsService } from './transactions.service.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
  createTransferSchema,
} from './transactions.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const transactionsService = new TransactionsService();

export class TransactionsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const query = queryTransactionsSchema.parse(request.query);
    const result = await transactionsService.list(userId, query);
    return reply.send(result);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = createTransactionSchema.parse(request.body);
    const transaction = await transactionsService.createManual(userId, body);
    return reply.status(201).send({
      message: 'Transação registrada com sucesso!',
      transaction,
    });
  }

  async transfer(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = createTransferSchema.parse(request.body);
    const result = await transactionsService.createTransfer(userId, body);
    return reply.status(201).send(result);
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = updateTransactionSchema.parse(request.body);
    const updated = await transactionsService.update(userId, request.params.id, body);
    return reply.send({
      message: 'Transação atualizada com sucesso!',
      transaction: updated,
    });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const result = await transactionsService.delete(userId, request.params.id);
    return reply.send(result);
  }

  async summary(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const query = request.query as { month?: string; year?: string };
    const month = query.month ? parseInt(query.month, 10) : undefined;
    const year = query.year ? parseInt(query.year, 10) : undefined;
    const summary = await transactionsService.getSummary(userId, month, year);
    return reply.send({ summary });
  }
}

