import { FastifyInstance } from 'fastify';
import { SystemNumbersController } from './system-numbers.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const systemNumbersController = new SystemNumbersController();

export async function systemNumbersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.get('/', systemNumbersController.list);
}
