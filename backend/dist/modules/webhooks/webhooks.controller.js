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
    // Webhook da Meta Cloud API: Validação de Handshake (GET)
    async handleMetaWebhookVerification(request, reply) {
        try {
            const query = request.query;
            const mode = query['hub.mode'];
            const token = query['hub.verify_token'];
            const challenge = query['hub.challenge'];
            const result = await webhooksService.verifyMetaWebhook(mode, token, challenge);
            if (result.success) {
                return reply.status(200).send(result.challenge);
            }
            else {
                return reply.status(403).send('Forbidden: Token de verificação inválido.');
            }
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send('Internal Server Error');
        }
    }
    // Webhook da Meta Cloud API: Recepção de Eventos e Mensagens (POST)
    async handleMetaWebhook(request, reply) {
        try {
            const payload = request.body;
            // Resposta imediata HTTP 200 para a Meta
            reply.status(200).send({ status: 'EVENT_RECEIVED' });
            // Processamento em segundo plano
            webhooksService.processMetaMessage(payload).catch((err) => {
                console.error('❌ [Meta Webhook] Erro no processamento assíncrono:', err);
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(200).send({ status: 'EVENT_RECEIVED' });
        }
    }
    // Webhook do Telegram Bot: Recepção de Updates e Mensagens (POST)
    async handleTelegramWebhook(request, reply) {
        try {
            const payload = request.body;
            // Resposta imediata HTTP 200 para o Telegram (obrigatório para evitar retries)
            reply.status(200).send({ ok: true });
            // Processamento assíncrono
            webhooksService.processTelegramMessage(payload).catch((err) => {
                console.error('❌ [Telegram Webhook] Erro no processamento assíncrono:', err);
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(200).send({ ok: true });
        }
    }
    // Endpoint para testes e simulação de mensagens de WhatsApp e Telegram diretamente via API
    async simulateWhatsAppMessage(request, reply) {
        const { sender, message, instance = 'din-finance-01', channel = 'whatsapp', telegramId } = request.body || {};
        if (!message) {
            return reply.status(400).send({
                error: 'O campo message é obrigatório para simulação.',
            });
        }
        if (channel === 'telegram') {
            const numTelegramId = telegramId ? parseInt(telegramId, 10) : 999888777;
            const mockTelegramPayload = {
                update_id: Date.now(),
                message: {
                    message_id: Date.now(),
                    from: {
                        id: numTelegramId,
                        is_bot: false,
                        first_name: 'Simulador Telegram',
                        username: 'simulador_user',
                    },
                    chat: {
                        id: numTelegramId,
                        type: 'private',
                    },
                    date: Math.floor(Date.now() / 1000),
                    text: message,
                },
            };
            const result = await webhooksService.processTelegramMessage(mockTelegramPayload);
            return reply.status(200).send({
                message: 'Simulação de Telegram processada com sucesso!',
                result,
            });
        }
        if (!sender) {
            return reply.status(400).send({
                error: 'O campo sender é obrigatório para simulação de WhatsApp.',
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
