import { FastifyRequest, FastifyReply } from 'fastify';
export declare class SubscriptionsController {
    getMySubscription(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getPlans(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
    createCheckout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const subscriptionsController: SubscriptionsController;
