import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { BudgetsService } from './budgets.service.js';
import {
  listBudgetsQuerySchema,
  upsertBudgetSchema,
  updateBudgetSchema,
  copyBudgetsSchema,
} from './budgets.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const budgetsService = new BudgetsService();

function formatZodMessage(error: ZodError): string {
  return error.issues?.[0]?.message || (error as any).errors?.[0]?.message || 'Dados inválidos.';
}

export class BudgetsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const query = listBudgetsQuerySchema.parse(request.query);
      const result = await budgetsService.getMonthlyBudgets(userId, query.month, query.year);
      return reply.status(200).send(result);
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        return reply.status(400).send({ message: formatZodMessage(error) });
      }
      if (error.statusCode) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ message: 'Erro ao buscar orçamentos mensais.' });
    }
  }

  async upsert(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const data = upsertBudgetSchema.parse(request.body);
      const result = await budgetsService.upsertBudget(userId, data);
      return reply.status(200).send(result);
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        return reply.status(400).send({ message: formatZodMessage(error) });
      }
      if (error.statusCode) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      request.log.error(error);
      return reply.status(400).send({ message: error.message || 'Erro ao salvar orçamento.' });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const data = updateBudgetSchema.parse(request.body);
      const result = await budgetsService.updateBudget(userId, id, data);
      return reply.status(200).send(result);
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        return reply.status(400).send({ message: formatZodMessage(error) });
      }
      if (error.statusCode) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      request.log.error(error);
      return reply.status(400).send({ message: error.message || 'Erro ao atualizar orçamento.' });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const result = await budgetsService.deleteBudget(userId, id);
      return reply.status(200).send(result);
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        return reply.status(400).send({ message: formatZodMessage(error) });
      }
      if (error.statusCode) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ message: 'Erro ao remover orçamento.' });
    }
  }

  async copyPrevious(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const data = copyBudgetsSchema.parse(request.body);
      const result = await budgetsService.copyFromPreviousMonth(userId, data);
      return reply.status(200).send(result);
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        return reply.status(400).send({ message: formatZodMessage(error) });
      }
      if (error.statusCode) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      request.log.error(error);
      return reply.status(400).send({ message: error.message || 'Erro ao copiar orçamentos do mês anterior.' });
    }
  }
}
