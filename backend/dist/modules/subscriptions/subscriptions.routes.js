"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionsRoutes = subscriptionsRoutes;
const subscriptions_controller_js_1 = require("./subscriptions.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
async function subscriptionsRoutes(app) {
    // Planos disponíveis (público / autenticado)
    app.get('/plans', subscriptions_controller_js_1.subscriptionsController.getPlans);
    // Rotas autenticadas do usuário
    app.register(async (authGroup) => {
        authGroup.addHook('preHandler', auth_middleware_js_1.authenticate);
        authGroup.get('/my-subscription', subscriptions_controller_js_1.subscriptionsController.getMySubscription);
        authGroup.post('/checkout', subscriptions_controller_js_1.subscriptionsController.createCheckout);
    });
}
