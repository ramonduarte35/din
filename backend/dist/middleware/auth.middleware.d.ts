import { FastifyRequest, FastifyReply } from 'fastify';
export interface TokenPayload {
    userId: string;
    email: string;
}
declare module 'fastify' {
    interface FastifyRequest {
        userPayload?: TokenPayload;
        currentUser?: {
            id: string;
            name: string;
            email: string;
            phone_number: string | null;
            subscription_tier: 'FREE' | 'PRO';
            role: 'USER' | 'ADMIN';
        };
    }
}
export declare function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
