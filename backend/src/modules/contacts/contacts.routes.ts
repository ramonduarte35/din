import { FastifyInstance } from 'fastify';
import { ContactsController } from './contacts.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const controller = new ContactsController();

export async function contactsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate);

  app.post('/', controller.create.bind(controller));
  app.get('/', controller.list.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
