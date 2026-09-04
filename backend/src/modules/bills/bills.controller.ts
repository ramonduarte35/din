import { FastifyRequest, FastifyReply } from 'fastify';
import { BillsService } from './bills.service.js';
import { billsNotificationService } from './bills-notification.service.js';
import { createBillSchema, updateBillSchema, payBillSchema, listBillsQuerySchema } from './bills.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const billsService = new BillsService();

export class BillsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const data = createBillSchema.parse(request.body);
      const bill = await billsService.createBill(userId, data);
      return reply.status(201).send(bill);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao criar conta a pagar' });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const query = listBillsQuerySchema.parse(request.query);
      const result = await billsService.listBills(userId, query);
      return reply.send(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Parâmetros inválidos' });
      }
      return reply.status(500).send({ message: 'Erro ao listar contas a pagar' });
    }
  }

  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { month, year } = request.query as { month?: string; year?: string };
      const summary = await billsService.getBillSummary(
        userId,
        month ? parseInt(month, 10) : undefined,
        year ? parseInt(year, 10) : undefined
      );
      return reply.send(summary);
    } catch (error: any) {
      return reply.status(500).send({ message: 'Erro ao obter resumo de contas a pagar' });
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const bill = await billsService.getBillById(userId, id);
      return reply.send(bill);
    } catch (error: any) {
      return reply.status(404).send({ message: error.message || 'Conta a pagar não encontrada' });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const data = updateBillSchema.parse(request.body);
      const updated = await billsService.updateBill(userId, id, data);
      return reply.send(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao atualizar conta a pagar' });
    }
  }

  async pay(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const data = payBillSchema.parse(request.body);
      const result = await billsService.payBill(userId, id, data);
      return reply.send(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
      }
      return reply.status(400).send({ message: error.message || 'Erro ao liquidar conta a pagar' });
    }
  }

  async unpay(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const result = await billsService.unpayBill(userId, id);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || 'Erro ao desfazer pagamento' });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const { id } = request.params;
      const result = await billsService.deleteBill(userId, id);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || 'Erro ao excluir conta a pagar' });
    }
  }

  async notifyDue(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = getUserId(request);
      const result = await billsNotificationService.dispatchDueBillNotifications({ userId, force: true });
      return reply.send(result);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message || 'Erro ao disparar notificações de contas' });
    }
  }

  async adminNotifyAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await billsNotificationService.dispatchDueBillNotifications({ force: false });
      return reply.send(result);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message || 'Erro ao processar notificações globais' });
    }
  }
}

