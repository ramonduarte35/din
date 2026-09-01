"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRoutes = webhooksRoutes;
const webhooks_controller_js_1 = require("./webhooks.controller.js");
const webhooksController = new webhooks_controller_js_1.WebhooksController();
async function webhooksRoutes(app) {
    // Webhook principal do Evolution Go (POST /api/v1/webhooks/evolution)
    app.post('/evolution', webhooksController.handleEvolutionWebhook);
    // Endpoint de simulação para desenvolvimento e testes rápidos
    app.post('/simulate', webhooksController.simulateWhatsAppMessage);
}
