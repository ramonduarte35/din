import { FastifyRequest, FastifyReply } from 'fastify';
export declare class WebhooksController {
    handleEvolutionWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    handleMetaWebhookVerification(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    handleMetaWebhook(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
    handleTelegramWebhook(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
    simulateWhatsAppMessage(request: FastifyRequest<{
        Body: {
            sender: string;
            message: string;
            instance?: string;
            channel?: 'whatsapp' | 'telegram';
            telegramId?: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
