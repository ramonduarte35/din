"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetsController = void 0;
const zod_1 = require("zod");
const budgets_service_js_1 = require("./budgets.service.js");
const budgets_schemas_js_1 = require("./budgets.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const budgetsService = new budgets_service_js_1.BudgetsService();
function formatZodMessage(error) {
    return error.issues?.[0]?.message || error.errors?.[0]?.message || 'Dados inválidos.';
}
class BudgetsController {
    async list(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const query = budgets_schemas_js_1.listBudgetsQuerySchema.parse(request.query);
            const result = await budgetsService.getMonthlyBudgets(userId, query.month, query.year);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
                return reply.status(400).send({ message: formatZodMessage(error) });
            }
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message });
            }
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar orçamentos mensais.' });
        }
    }
    async upsert(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const data = budgets_schemas_js_1.upsertBudgetSchema.parse(request.body);
            const result = await budgetsService.upsertBudget(userId, data);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
                return reply.status(400).send({ message: formatZodMessage(error) });
            }
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message });
            }
            request.log.error(error);
            return reply.status(400).send({ message: error.message || 'Erro ao salvar orçamento.' });
        }
    }
    async update(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const data = budgets_schemas_js_1.updateBudgetSchema.parse(request.body);
            const result = await budgetsService.updateBudget(userId, id, data);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
                return reply.status(400).send({ message: formatZodMessage(error) });
            }
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message });
            }
            request.log.error(error);
            return reply.status(400).send({ message: error.message || 'Erro ao atualizar orçamento.' });
        }
    }
    async delete(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const { id } = request.params;
            const result = await budgetsService.deleteBudget(userId, id);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
                return reply.status(400).send({ message: formatZodMessage(error) });
            }
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message });
            }
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao remover orçamento.' });
        }
    }
    async copyPrevious(request, reply) {
        try {
            const userId = (0, auth_middleware_js_1.getUserId)(request);
            const data = budgets_schemas_js_1.copyBudgetsSchema.parse(request.body);
            const result = await budgetsService.copyFromPreviousMonth(userId, data);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
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
exports.BudgetsController = BudgetsController;
