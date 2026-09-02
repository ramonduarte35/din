"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillsController = void 0;
const bills_service_js_1 = require("./bills.service.js");
const bills_schemas_js_1 = require("./bills.schemas.js");
const billsService = new bills_service_js_1.BillsService();
class BillsController {
    async create(request, reply) {
        try {
            const userId = request.user.id;
            const data = bills_schemas_js_1.createBillSchema.parse(request.body);
            const bill = await billsService.createBill(userId, data);
            return reply.status(201).send(bill);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao criar conta a pagar' });
        }
    }
    async list(request, reply) {
        try {
            const userId = request.user.id;
            const query = bills_schemas_js_1.listBillsQuerySchema.parse(request.query);
            const result = await billsService.listBills(userId, query);
            return reply.send(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Parâmetros inválidos' });
            }
            return reply.status(500).send({ message: 'Erro ao listar contas a pagar' });
        }
    }
    async getSummary(request, reply) {
        try {
            const userId = request.user.id;
            const { month, year } = request.query;
            const summary = await billsService.getBillSummary(userId, month ? parseInt(month, 10) : undefined, year ? parseInt(year, 10) : undefined);
            return reply.send(summary);
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao obter resumo de contas a pagar' });
        }
    }
    async getById(request, reply) {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const bill = await billsService.getBillById(userId, id);
            return reply.send(bill);
        }
        catch (error) {
            return reply.status(404).send({ message: error.message || 'Conta a pagar não encontrada' });
        }
    }
    async update(request, reply) {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const data = bills_schemas_js_1.updateBillSchema.parse(request.body);
            const updated = await billsService.updateBill(userId, id, data);
            return reply.send(updated);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao atualizar conta a pagar' });
        }
    }
    async pay(request, reply) {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const data = bills_schemas_js_1.payBillSchema.parse(request.body);
            const result = await billsService.payBill(userId, id, data);
            return reply.send(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao liquidar conta a pagar' });
        }
    }
    async unpay(request, reply) {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const result = await billsService.unpayBill(userId, id);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(400).send({ message: error.message || 'Erro ao desfazer pagamento' });
        }
    }
    async delete(request, reply) {
        try {
            const userId = request.user.id;
            const { id } = request.params;
            const result = await billsService.deleteBill(userId, id);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(400).send({ message: error.message || 'Erro ao excluir conta a pagar' });
        }
    }
}
exports.BillsController = BillsController;
