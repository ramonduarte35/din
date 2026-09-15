import { FastifyRequest, FastifyReply } from 'fastify';
export declare class BudgetsController {
    list(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    upsert(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    update(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    delete(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    copyPrevious(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
