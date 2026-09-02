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
        error?: string;
    }>;
    getLicenseRegisterUrl(): Promise<{
        register_url: string | null;
        status: string;
        instance_id?: string;
    }>;
    activateLicense(code: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
        details?: any;
    }>;
    testConnection(): Promise<{
        is_online: boolean;
        base_url: string;
        api_key_configured: boolean;
        license: {
            status: string;
            instance_id?: string;
            register_url?: string | null;
        };
        instances_count: number;
        latency_ms: number;
        error?: string;
    }>;
    fetchInstances(): Promise<any[]>;
    createInstance(instanceName: string): Promise<any>;
    connectInstance(instanceName: string): Promise<{
        base64: any;
        code: any;
        qrcode: {
            base64: any;
        };
    }>;
    getConnectionState(instanceName: string): Promise<{
        state: string;
    }>;
    restartInstance(instanceName: string): Promise<{
        base64: any;
        code: any;
        qrcode: {
            base64: any;
        };
    }>;
    logoutInstance(instanceName: string): Promise<any>;
    deleteInstance(instanceName: string): Promise<any>;
    setWebhook(instanceName: string, webhookUrl: string): Promise<any>;
}
export declare const evolutionClient: EvolutionClient;
