"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsController = void 0;
const goals_service_js_1 = require("./goals.service.js");
const goals_schemas_js_1 = require("./goals.schemas.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const goalsService = new goals_service_js_1.GoalsService();
class GoalsController {
    async list(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const goals = await goalsService.listGoals(userId);
        return reply.send({ goals });
    }
    async create(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = goals_schemas_js_1.createGoalSchema.parse(request.body);
        const goal = await goalsService.createGoal(userId, body);
        return reply.status(201).send({
            message: 'Meta financeira criada com sucesso!',
            goal,
        });
    }
    async update(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = goals_schemas_js_1.updateGoalSchema.parse(request.body);
        const goal = await goalsService.updateGoal(userId, request.params.id, body);
        return reply.send({
            message: 'Meta financeira atualizada!',
            goal,
        });
    }
    async deposit(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const body = goals_schemas_js_1.depositGoalSchema.parse(request.body);
        const goal = await goalsService.depositGoal(userId, request.params.id, body);
        return reply.send({
            message: 'Aporte realizado com sucesso!',
            goal,
        });
    }
    async delete(request, reply) {
        const userId = (0, auth_middleware_js_1.getUserId)(request);
        const result = await goalsService.deleteGoal(userId, request.params.id);
        return reply.send(result);
    }
}
exports.GoalsController = GoalsController;
