export declare const env: {
    DATABASE_URL: string;
    NODE_ENV: "production" | "development" | "test";
    PORT: number;
    REDIS_URL: string;
    JWT_SECRET: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    OPENAI_API_KEY: string;
    OPENAI_MODEL: string;
    EVOLUTION_API_URL: string;
    EVOLUTION_GLOBAL_API_KEY: string;
    EVOLUTION_WEBHOOK_SECRET: string;
    TELEGRAM_BOT_TOKEN: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    ASAAS_API_KEY: string;
    ASAAS_ENVIRONMENT: "production" | "sandbox";
    ASAAS_WEBHOOK_TOKEN: string;
    APP_URL: string;
};
/**
 * Verifica se um e-mail possui privilégio de administrador do sistema.
 * Suporta um único e-mail ou múltiplos e-mails separados por vírgula em ADMIN_EMAIL.
 */
export declare function isSystemAdminEmail(email?: string | null): boolean;
