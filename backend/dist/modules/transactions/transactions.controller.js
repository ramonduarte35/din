"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const transactions_service_js_1 = require("./transactions.service.js");
const transactions_schemas_js_1 = require("./transactions.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const transactionsService = new transactions_service_js_1.TransactionsService();
class TransactionsController {
    async list(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const query = transactions_schemas_js_1.queryTransactionsSchema.parse(request.query);
        const result = await transactionsService.list(userId, query);
        return reply.send(result);
    }
    async create(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = transactions_schemas_js_1.createTransactionSchema.parse(request.body);
        const transaction = await transactionsService.createManual(userId, body);
        return reply.status(201).send({
            message: 'Transação registrada com sucesso!',
            transaction,
        });
    }
    async transfer(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = transactions_schemas_js_1.createTransferSchema.parse(request.body);
        const result = await transactionsService.createTransfer(userId, body);
        return reply.status(201).send(result);
    }
    async update(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = transactions_schemas_js_1.updateTransactionSchema.parse(request.body);
        const updated = await transactionsService.update(userId, request.params.id, body);
        return reply.send({
            message: 'Transação atualizada com sucesso!',
            transaction: updated,
        });
    }
    async delete(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const result = await transactionsService.delete(userId, request.params.id);
        return reply.send(result);
    }
    async summary(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const query = request.query;
        const month = query.month ? parseInt(query.month, 10) : undefined;
        const year = query.year ? parseInt(query.year, 10) : undefined;
        const summary = await transactionsService.getSummary(userId, month, year);
        return reply.send({ summary });
    }
}
exports.TransactionsController = TransactionsController;
