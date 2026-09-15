export interface MetaConnectionStatus {
    success: boolean;
    phoneNumberId?: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
    qualityRating?: string;
    status?: string;
    error?: string;
}
export declare class MetaCloudApiClient {
    private readonly defaultGraphApiVersion;
    private readonly baseUrl;
    /**
     * Obtém a configuração salva da Meta no banco de dados com fallback para variáveis de ambiente (.env)
     */
    getConfig(): Promise<{
        active_provider: import("@prisma/client").$Enums.WhatsAppProviderType;
        meta_phone_number_id: string | undefined;
        meta_waba_id: string | undefined;
        meta_access_token: string | undefined;
        meta_verify_token: string;
        meta_app_secret: string | undefined;
    }>;
    /**
     * Envia uma mensagem de texto via WhatsApp Cloud API
     */
    sendText(recipientNumber: string, message: string, options?: {
        phoneNumberId?: string;
        accessToken?: string;
    }): Promise<boolean>;
    /**
     * Realiza o download de uma mídia de áudio recebida no webhook da Meta
     */
    downloadAudioMedia(mediaId: string, options?: {
        accessToken?: string;
    }): Promise<{
        buffer: Buffer;
        mimeType: string;
    } | null>;
    /**
     * Testa e valida as credenciais da Meta Cloud API
     */
    testConnection(phoneNumberId?: string, accessToken?: string): Promise<MetaConnectionStatus>;
    /**
     * Valida a assinatura HMAC-SHA256 do payload do webhook da Meta (X-Hub-Signature-256)
     */
    verifyWebhookSignature(rawBody: string, signatureHeader?: string, appSecret?: string): boolean;
}
export declare const metaClient: MetaCloudApiClient;
