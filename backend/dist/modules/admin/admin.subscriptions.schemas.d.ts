import { z } from 'zod';
export declare const manageUserSubscriptionSchema: z.ZodObject<{
    subscription_tier: z.ZodEnum<["FREE", "PRO"]>;
    subscription_status: z.ZodOptional<z.ZodEnum<["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "EXPIRED"]>>;
    days_to_add: z.ZodOptional<z.ZodNumber>;
    expires_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_lifetime: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subscription_tier: "FREE" | "PRO";
    subscription_status?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | undefined;
    notes?: string | undefined;
    days_to_add?: number | undefined;
    expires_at?: string | null | undefined;
    is_lifetime?: boolean | undefined;
}, {
    subscription_tier: "FREE" | "PRO";
    subscription_status?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | undefined;
    notes?: string | undefined;
    days_to_add?: number | undefined;
    expires_at?: string | null | undefined;
    is_lifetime?: boolean | undefined;
}>;
export type ManageUserSubscriptionInput = z.infer<typeof manageUserSubscriptionSchema>;
export declare const queryUsersSubscriptionSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    tier: z.ZodDefault<z.ZodEnum<["ALL", "FREE", "PRO"]>>;
    status: z.ZodDefault<z.ZodEnum<["ALL", "ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "EXPIRED"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "ALL";
    page: number;
    limit: number;
    tier: "FREE" | "PRO" | "ALL";
    search?: string | undefined;
}, {
    status?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "ALL" | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    tier?: "FREE" | "PRO" | "ALL" | undefined;
}>;
export type QueryUsersSubscriptionInput = z.infer<typeof queryUsersSubscriptionSchema>;
