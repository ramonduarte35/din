import { FastifyRequest, FastifyReply } from 'fastify';
export declare class ReceivablesController {
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
    receive(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    unreceive(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    delete(request: FastifyRequest<{
        Params: {
            id: string;
        };
        Querystring: {
            scope?: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
