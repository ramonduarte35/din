import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { systemNumbersRoutes } from './modules/system-numbers/system-numbers.routes.js';
import { transactionsRoutes } from './modules/transactions/transactions.routes.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  });

  // Plugins globais
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '7d',
    },
  });

  // Error Handler Global
  app.setErrorHandler(errorHandler);

  // Healthcheck
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'Din Financial Backend API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Registro de Rotas com prefixo /api/v1
  app.register(
    async (v1) => {
      v1.register(authRoutes, { prefix: '/auth' });
      v1.register(usersRoutes, { prefix: '/users' });
      v1.register(categoriesRoutes, { prefix: '/categories' });
      v1.register(systemNumbersRoutes, { prefix: '/system-numbers' });
      v1.register(transactionsRoutes, { prefix: '/transactions' });
      v1.register(webhooksRoutes, { prefix: '/webhooks' });
    },
    { prefix: '/api/v1' }
  );

  return app;
}
