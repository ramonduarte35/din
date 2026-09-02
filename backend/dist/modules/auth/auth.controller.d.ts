import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AuthController {
    register(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    login(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    googleLogin(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getConfig(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
