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
     * Obtém a configuração salva da Meta no banco de dados
     */
    getConfig(): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        active_provider: import("@prisma/client").$Enums.WhatsAppProviderType;
        meta_phone_number_id: string | null;
        meta_waba_id: string | null;
        meta_access_token: string | null;
        meta_verify_token: string | null;
        meta_app_secret: string | null;
        telegram_bot_token: string | null;
        telegram_bot_username: string | null;
        telegram_is_active: boolean;
        telegram_webhook_secret: string | null;
    } | null>;
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
