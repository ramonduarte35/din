import { FastifyInstance } from 'fastify';
import { CategoriesController } from './categories.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const categoriesController = new CategoriesController();

export async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/', categoriesController.list);
  app.post('/', categoriesController.create);
  app.delete('/:id', categoriesController.delete);
}
