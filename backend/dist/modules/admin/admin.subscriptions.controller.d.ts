import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminSubscriptionsController {
    getOverview(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getUsers(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    manageUserSubscription(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    getPayments(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const adminSubscriptionsController: AdminSubscriptionsController;
