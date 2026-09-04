import { FastifyRequest, FastifyReply } from 'fastify';
export declare class UsersController {
    getProfile(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    changePassword(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    generateTelegramLinkCode(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    unlinkTelegram(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
