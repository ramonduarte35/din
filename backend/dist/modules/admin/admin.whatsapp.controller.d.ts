import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminWhatsAppController {
    getSettings(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    updateSettings(request: FastifyRequest, reply: FastifyReply): Promise<never>;
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
    getEvolutionStatus(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getEvolutionLicense(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    testEvolutionConnection(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    activateEvolutionLicense(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getProviderConfig(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    updateProviderConfig(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    testMetaConnection(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    testTelegramConnection(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    setTelegramWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getTelegramStatus(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const adminWhatsAppController: AdminWhatsAppController;
