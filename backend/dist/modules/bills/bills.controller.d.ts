import { FastifyRequest, FastifyReply } from 'fastify';
export declare class BillsController {
    create(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    list(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getSummary(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getById(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    update(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    pay(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    unpay(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    delete(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
