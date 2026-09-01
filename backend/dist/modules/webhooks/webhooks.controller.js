"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const webhooks_service_js_1 = require("./webhooks.service.js");
const webhooksService = new webhooks_service_js_1.WebhooksService();
class WebhooksController {
    async handleEvolutionWebhook(request, reply) {
        try {
            const payload = request.body;
            const result = await webhooksService.processEvolutionMessage(payload);
            return reply.status(200).send({ success: true, result });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(200).send({ success: false, error: error.message });
        }
    }
    // Endpoint para testes e simulação de mensagens do WhatsApp diretamente via API
    async simulateWhatsAppMessage(request, reply) {
        const { sender, message, instance = 'din-finance-01' } = request.body || {};
        if (!sender || !message) {
            return reply.status(400).send({
                error: 'Campos sender e message são obrigatórios para simulação.',
            });
        }
        const mockPayload = {
            event: 'messages.upsert',
            instance,
            data: {
                key: {
                    remoteJid: sender.includes('@') ? sender : `${sender}@s.whatsapp.net`,
                    fromMe: false,
                    id: `sim_${Date.now()}`,
                },
                message: {
                    conversation: message,
                },
            },
        };
        const result = await webhooksService.processEvolutionMessage(mockPayload);
        return reply.status(200).send({
            message: 'Simulação de WhatsApp processada com sucesso!',
            result,
        });
    }
}
exports.WebhooksController = WebhooksController;
