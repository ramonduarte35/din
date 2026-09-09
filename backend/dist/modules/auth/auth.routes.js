"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_js_1 = require("./auth.controller.js");
const authController = new auth_controller_js_1.AuthController();
async function authRoutes(app) {
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
