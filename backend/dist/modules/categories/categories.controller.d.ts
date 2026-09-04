import { FastifyRequest, FastifyReply } from 'fastify';
export declare class CategoriesController {
    list(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    create(request: FastifyRequest, reply: FastifyReply): Promise<never>;
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
}
