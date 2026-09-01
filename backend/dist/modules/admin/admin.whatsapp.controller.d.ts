import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminWhatsAppController {
    listInstances(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    createInstance(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getQrCode(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    getInstanceStatus(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    restartInstance(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    logoutInstance(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    updateInstance(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    deleteInstance(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    getLogs(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const adminWhatsAppController: AdminWhatsAppController;
