"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSubscriptionsRoutes = adminSubscriptionsRoutes;
const admin_subscriptions_controller_js_1 = require("./admin.subscriptions.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
async function adminSubscriptionsRoutes(app) {
    // Todas as rotas administrativas requerem autenticação e Role ADMIN
    app.addHook('preHandler', auth_middleware_js_1.requireAdmin);
    // Visão geral executiva e métricas (MRR, total usuários, etc.)
    app.get('/overview', admin_subscriptions_controller_js_1.adminSubscriptionsController.getOverview);
    // Listagem e busca de usuários com planos
    app.get('/users', admin_subscriptions_controller_js_1.adminSubscriptionsController.getUsers);
    // Gestão manual do plano de um usuário
    app.post('/users/:id/manage', admin_subscriptions_controller_js_1.adminSubscriptionsController.manageUserSubscription);
    // Histórico de pagamentos e cobranças do Asaas
    app.get('/payments', admin_subscriptions_controller_js_1.adminSubscriptionsController.getPayments);
}
