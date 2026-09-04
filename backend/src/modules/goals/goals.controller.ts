import { FastifyRequest, FastifyReply } from 'fastify';
import { GoalsService } from './goals.service.js';
import { createGoalSchema, updateGoalSchema, depositGoalSchema } from './goals.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const goalsService = new GoalsService();

export class GoalsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const goals = await goalsService.listGoals(userId);
    return reply.send({ goals });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = createGoalSchema.parse(request.body);
    const goal = await goalsService.createGoal(userId, body);
    return reply.status(201).send({
      message: 'Meta financeira criada com sucesso!',
      goal,
    });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = updateGoalSchema.parse(request.body);
    const goal = await goalsService.updateGoal(userId, request.params.id, body);
    return reply.send({
      message: 'Meta financeira atualizada!',
      goal,
    });
  }

  async deposit(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = depositGoalSchema.parse(request.body);
    const goal = await goalsService.depositGoal(userId, request.params.id, body);
    return reply.send({
      message: 'Aporte realizado com sucesso!',
      goal,
    });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const result = await goalsService.deleteGoal(userId, request.params.id);
    return reply.send(result);
  }
}
