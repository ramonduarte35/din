import { FastifyInstance } from 'fastify';
import { AccountsController } from './accounts.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const accountsController = new AccountsController();

export async function accountsRoutes(app: FastifyInstance) {
  // Todas as rotas de contas requerem autenticação do usuário
  app.addHook('onRequest', authenticate);

  app.get('/', accountsController.list);
  app.get('/:id', accountsController.getById);
  app.post('/', accountsController.create);
  app.put('/:id', accountsController.update);
  app.delete('/:id', accountsController.delete);
}
