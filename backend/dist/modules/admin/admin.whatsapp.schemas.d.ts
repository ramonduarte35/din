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
export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>;
export type LogsQueryInput = z.infer<typeof logsQuerySchema>;
export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
