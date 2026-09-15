"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivablesController = void 0;
const receivables_service_js_1 = require("./receivables.service.js");
const receivables_schemas_js_1 = require("./receivables.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const receivablesService = new receivables_service_js_1.ReceivablesService();
class ReceivablesController {
    async create(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const data = receivables_schemas_js_1.createReceivableSchema.parse(request.body);
            const receivable = await receivablesService.createReceivable(userId, data);
            return reply.status(201).send(receivable);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao criar conta a receber' });
        }
    }
    async list(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const query = receivables_schemas_js_1.listReceivablesQuerySchema.parse(request.query);
            const result = await receivablesService.listReceivables(userId, query);
            return reply.send(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Parâmetros inválidos' });
            }
            return reply.status(500).send({ message: 'Erro ao listar contas a receber' });
        }
    }
    async getSummary(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { month, year } = request.query;
            const summary = await receivablesService.getReceivableSummary(userId, month ? parseInt(month, 10) : undefined, year ? parseInt(year, 10) : undefined);
            return reply.send(summary);
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao obter resumo de contas a receber' });
        }
    }
    async getById(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const receivable = await receivablesService.getReceivableById(userId, id);
            return reply.send(receivable);
        }
        catch (error) {
            return reply.status(404).send({ message: error.message || 'Conta a receber não encontrada' });
        }
    }
    async update(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const data = receivables_schemas_js_1.updateReceivableSchema.parse(request.body);
            const updated = await receivablesService.updateReceivable(userId, id, data);
            return reply.send(updated);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao atualizar conta a receber' });
        }
    }
    async receive(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const data = receivables_schemas_js_1.receiveReceivableSchema.parse(request.body);
            const result = await receivablesService.receiveReceivable(userId, id, data);
            return reply.send(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({ message: error.errors[0]?.message || 'Dados inválidos' });
            }
            return reply.status(400).send({ message: error.message || 'Erro ao registrar recebimento' });
        }
    }
    async unreceive(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const result = await receivablesService.unreceiveReceivable(userId, id);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(400).send({ message: error.message || 'Erro ao desfazer recebimento' });
        }
    }
    async delete(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const scope = request.query.scope === 'ALL' ? 'ALL' : 'SINGLE';
            const result = await receivablesService.deleteReceivable(userId, id, scope);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(400).send({ message: error.message || 'Erro ao excluir conta a receber' });
        }
    }
}
exports.ReceivablesController = ReceivablesController;
