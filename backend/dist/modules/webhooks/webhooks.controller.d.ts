import { FastifyRequest, FastifyReply } from 'fastify';
export declare class WebhooksController {
    handleEvolutionWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    handleMetaWebhookVerification(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    handleMetaWebhook(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
    simulateWhatsAppMessage(request: FastifyRequest<{
        Body: {
            sender: string;
            message: string;
            instance?: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
