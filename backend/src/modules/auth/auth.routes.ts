import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  // Rate limit restrito para rotas de autenticação (anti brute-force)
  app.addHook('onRoute', (routeOptions) => {
    if (['/register', '/login', '/google'].includes(routeOptions.url)) {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Muitas tentativas de autenticação. Aguarde 1 minuto.',
          }),
        },
      };
    }
  });

  app.post('/register', authController.register);
  app.post('/login', authController.login);
  app.post('/google', authController.googleLogin);
  app.get('/config', authController.getConfig);
}


