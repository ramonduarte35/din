export interface EvolutionInstanceInfo {
    instanceName: string;
    owner?: string;
    profileName?: string;
    profilePictureUrl?: string;
    status: 'open' | 'close' | 'connecting' | 'qrcode' | string;
    qrcode?: {
        code?: string;
        base64?: string;
        pairingCode?: string;
    };
}
export declare class EvolutionClient {
    private baseUrl;
    private apiKey;
    constructor();
    private getHeaders;
    sendText(instanceName: string, recipientNumber: string, message: string): Promise<boolean>;
    getLicenseStatus(): Promise<{
        status: string;
        instance_id?: string;
    }>;
    getLicenseRegisterUrl(): Promise<string | null>;
    fetchInstances(): Promise<any[]>;
    createInstance(instanceName: string): Promise<any>;
    connectInstance(instanceName: string): Promise<any>;
    getConnectionState(instanceName: string): Promise<{
        state: string;
    }>;
    restartInstance(instanceName: string): Promise<any>;
    logoutInstance(instanceName: string): Promise<any>;
    deleteInstance(instanceName: string): Promise<any>;
    setWebhook(instanceName: string, webhookUrl: string): Promise<any>;
}
export declare const evolutionClient: EvolutionClient;
