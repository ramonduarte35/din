import { z } from 'zod';
export declare const createInstanceSchema: z.ZodObject<{
    instance_name: z.ZodString;
    phone_number: z.ZodString;
    label: z.ZodString;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phone_number: string;
    instance_name: string;
    label: string;
    is_active: boolean;
}, {
    phone_number: string;
    instance_name: string;
    label: string;
    is_active?: boolean | undefined;
}>;
export declare const updateInstanceSchema: z.ZodObject<{
    phone_number: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phone_number?: string | undefined;
    label?: string | undefined;
    is_active?: boolean | undefined;
}, {
    phone_number?: string | undefined;
    label?: string | undefined;
    is_active?: boolean | undefined;
}>;
export declare const logsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["SUCCESS", "USER_NOT_FOUND", "PRO_REQUIRED", "PARSING_ERROR"]>>;
    sender: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "SUCCESS" | "USER_NOT_FOUND" | "PRO_REQUIRED" | "PARSING_ERROR" | undefined;
    sender?: string | undefined;
}, {
    status?: "SUCCESS" | "USER_NOT_FOUND" | "PRO_REQUIRED" | "PARSING_ERROR" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sender?: string | undefined;
}>;
export declare const updateSystemSettingsSchema: z.ZodObject<{
    reply_only_registered: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reply_only_registered?: boolean | undefined;
}, {
    reply_only_registered?: boolean | undefined;
}>;
export declare const updateWhatsAppConfigSchema: z.ZodObject<{
    active_provider: z.ZodOptional<z.ZodEnum<["EVOLUTION", "META_OFFICIAL"]>>;
    meta_phone_number_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    meta_waba_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    meta_access_token: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    meta_verify_token: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    meta_app_secret: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    telegram_bot_token: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    telegram_bot_username: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    telegram_is_active: z.ZodOptional<z.ZodBoolean>;
    telegram_webhook_secret: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    active_provider?: "EVOLUTION" | "META_OFFICIAL" | undefined;
    meta_phone_number_id?: string | null | undefined;
    meta_waba_id?: string | null | undefined;
    meta_access_token?: string | null | undefined;
    meta_verify_token?: string | null | undefined;
    meta_app_secret?: string | null | undefined;
    telegram_bot_token?: string | null | undefined;
    telegram_bot_username?: string | null | undefined;
    telegram_is_active?: boolean | undefined;
    telegram_webhook_secret?: string | null | undefined;
}, {
    active_provider?: "EVOLUTION" | "META_OFFICIAL" | undefined;
    meta_phone_number_id?: string | null | undefined;
    meta_waba_id?: string | null | undefined;
    meta_access_token?: string | null | undefined;
    meta_verify_token?: string | null | undefined;
    meta_app_secret?: string | null | undefined;
    telegram_bot_token?: string | null | undefined;
    telegram_bot_username?: string | null | undefined;
    telegram_is_active?: boolean | undefined;
    telegram_webhook_secret?: string | null | undefined;
}>;
export declare const testMetaConnectionSchema: z.ZodObject<{
    meta_phone_number_id: z.ZodOptional<z.ZodString>;
    meta_access_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    meta_phone_number_id?: string | undefined;
    meta_access_token?: string | undefined;
}, {
    meta_phone_number_id?: string | undefined;
    meta_access_token?: string | undefined;
}>;
export declare const testTelegramConnectionSchema: z.ZodObject<{
    telegram_bot_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    telegram_bot_token?: string | undefined;
}, {
    telegram_bot_token?: string | undefined;
}>;
export declare const setTelegramWebhookSchema: z.ZodObject<{
    webhook_url: z.ZodOptional<z.ZodString>;
    secret_token: z.ZodOptional<z.ZodString>;
    telegram_bot_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    telegram_bot_token?: string | undefined;
    webhook_url?: string | undefined;
    secret_token?: string | undefined;
}, {
    telegram_bot_token?: string | undefined;
    webhook_url?: string | undefined;
    secret_token?: string | undefined;
}>;
export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>;
export type LogsQueryInput = z.infer<typeof logsQuerySchema>;
export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
export type UpdateWhatsAppConfigInput = z.infer<typeof updateWhatsAppConfigSchema>;
export type TestMetaConnectionInput = z.infer<typeof testMetaConnectionSchema>;
export type TestTelegramConnectionInput = z.infer<typeof testTelegramConnectionSchema>;
export type SetTelegramWebhookInput = z.infer<typeof setTelegramWebhookSchema>;
