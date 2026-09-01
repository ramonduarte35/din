import { FastifyRequest, FastifyReply } from 'fastify';
export declare class WebhooksController {
    handleEvolutionWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    simulateWhatsAppMessage(request: FastifyRequest<{
        Body: {
            sender: string;
            message: string;
            instance?: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
