"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRoutes = webhooksRoutes;
const webhooks_controller_js_1 = require("./webhooks.controller.js");
const webhooksController = new webhooks_controller_js_1.WebhooksController();
async function webhooksRoutes(app) {
    // Webhook principal do Evolution Go (POST /api/v1/webhooks/evolution)
    app.post('/evolution', webhooksController.handleEvolutionWebhook);
    // Webhook Oficial da Meta Cloud API (WhatsApp Business)
    // GET: Handshake de verificação da Meta
    app.get('/meta', webhooksController.handleMetaWebhookVerification);
    // POST: Recepção de eventos e mensagens da Meta
    app.post('/meta', webhooksController.handleMetaWebhook);
    // Endpoint de simulação para desenvolvimento e testes rápidos
    app.post('/simulate', webhooksController.simulateWhatsAppMessage);
}
