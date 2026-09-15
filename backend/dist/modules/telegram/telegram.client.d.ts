export interface TelegramBotInfo {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
}
export interface TelegramWebhookInfo {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    ip_address?: string;
}
export interface TelegramStatusResponse {
    success: boolean;
    bot?: TelegramBotInfo;
    webhook?: TelegramWebhookInfo;
    is_active?: boolean;
    error?: string;
}
export declare class TelegramClient {
    private readonly baseUrl;
    /**
     * Obtém a configuração de integração salva no banco de dados
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
     * Obtém o token configurado (do banco ou passado explicitamente)
     */
    getEffectiveToken(token?: string): Promise<string | null>;
    /**
     * Testa a validade do token e obtém os dados do bot (getMe)
     */
    getMe(token?: string): Promise<{
        success: boolean;
        bot?: TelegramBotInfo;
        error?: string;
    }>;
    /**
     * Obtém as informações do webhook configurado no Telegram (getWebhookInfo)
     */
    getWebhookInfo(token?: string): Promise<{
        success: boolean;
        webhook?: TelegramWebhookInfo;
        error?: string;
    }>;
    /**
     * Registra ou atualiza o webhook do Telegram (setWebhook)
     */
    setWebhook(webhookUrl: string, secretToken?: string, token?: string): Promise<{
        success: boolean;
        message: string;
        error?: string;
    }>;
    /**
     * Remove o webhook configurado (deleteWebhook)
     */
    deleteWebhook(token?: string): Promise<{
        success: boolean;
        message: string;
        error?: string;
    }>;
    /**
     * Envia uma mensagem para o chat do Telegram
     */
    sendMessage(chatId: string | number, text: string, options?: {
        reply_markup?: any;
        parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
        token?: string;
    }): Promise<boolean>;
    /**
     * Baixa arquivo de áudio / voz do Telegram para transcrição
     */
    downloadVoiceAudio(fileId: string, token?: string): Promise<{
        buffer: Buffer;
        mimeType: string;
    } | null>;
}
export declare const telegramClient: TelegramClient;
