import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoriesService } from './categories.service.js';
import { createCategorySchema } from './categories.schemas.js';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const categories = await categoriesService.listCategories(userId);
    return reply.send({ categories });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const body = createCategorySchema.parse(request.body);
    const category = await categoriesService.createCategory(userId, body);
    return reply.status(201).send({ category });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.userPayload!.userId;
    const result = await categoriesService.deleteCategory(userId, request.params.id);
    return reply.send(result);
  }
}
