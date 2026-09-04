import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoriesService } from './categories.service.js';
import { createCategorySchema } from './categories.schemas.js';
import { getUserId } from '../../middleware/auth.middleware.js';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const categories = await categoriesService.listCategories(userId);
    return reply.send({ categories });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = createCategorySchema.parse(request.body);
    const category = await categoriesService.createCategory(userId, body);
    return reply.status(201).send({ category });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const body = createCategorySchema.partial().parse(request.body);
    const category = await categoriesService.updateCategory(userId, request.params.id, body);
    return reply.send({ category });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = getUserId(request);
    const result = await categoriesService.deleteCategory(userId, request.params.id);
    return reply.send(result);
  }
}

