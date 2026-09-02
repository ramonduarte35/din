import { FastifyRequest, FastifyReply } from 'fastify';
import { AccountsService } from './accounts.service.js';
import { createAccountSchema, updateAccountSchema } from './accounts.schemas.js';

const accountsService = new AccountsService();

export class AccountsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const accounts = await accountsService.list(userId);
    return reply.status(200).send(accounts);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { id } = request.params;
    const account = await accountsService.getById(userId, id);
    return reply.status(200).send(account);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const body = createAccountSchema.parse(request.body);
    const account = await accountsService.create(userId, body);
    return reply.status(201).send(account);
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { id } = request.params;
    const body = updateAccountSchema.parse(request.body);
    const updated = await accountsService.update(userId, id, body);
    return reply.status(200).send(updated);
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = (request.user as any).id;
    const { id } = request.params;
    const result = await accountsService.delete(userId, id);
    return reply.status(200).send(result);
  }
}
