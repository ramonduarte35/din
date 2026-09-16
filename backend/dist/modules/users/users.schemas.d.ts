import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    theme: z.ZodOptional<z.ZodEnum<["dark", "classic", "emerald", "midnight", "minimalist", "rose", "light", "purple"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone_number?: string | null | undefined;
    theme?: "dark" | "classic" | "emerald" | "midnight" | "minimalist" | "rose" | "light" | "purple" | undefined;
}, {
    name?: string | undefined;
    phone_number?: string | null | undefined;
    theme?: "dark" | "classic" | "emerald" | "midnight" | "minimalist" | "rose" | "light" | "purple" | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    current_password: z.ZodOptional<z.ZodString>;
    new_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    new_password: string;
    current_password?: string | undefined;
}, {
    new_password: string;
    current_password?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export declare const resetUserDataSchema: z.ZodObject<{
    delete_transactions: z.ZodDefault<z.ZodBoolean>;
    delete_bills: z.ZodDefault<z.ZodBoolean>;
    delete_receivables: z.ZodDefault<z.ZodBoolean>;
    reset_account_balances: z.ZodDefault<z.ZodBoolean>;
    delete_budgets_and_goals: z.ZodDefault<z.ZodBoolean>;
    delete_categories: z.ZodDefault<z.ZodBoolean>;
    delete_contacts: z.ZodDefault<z.ZodBoolean>;
    confirmation: z.ZodEffects<z.ZodString, "ZERAR" | "LIMPAR", string>;
}, "strip", z.ZodTypeAny, {
    delete_transactions: boolean;
    delete_bills: boolean;
    delete_receivables: boolean;
    reset_account_balances: boolean;
    delete_budgets_and_goals: boolean;
    delete_categories: boolean;
    delete_contacts: boolean;
    confirmation: "ZERAR" | "LIMPAR";
}, {
    confirmation: string;
    delete_transactions?: boolean | undefined;
    delete_bills?: boolean | undefined;
    delete_receivables?: boolean | undefined;
    reset_account_balances?: boolean | undefined;
    delete_budgets_and_goals?: boolean | undefined;
    delete_categories?: boolean | undefined;
    delete_contacts?: boolean | undefined;
}>;
export type ResetUserDataInput = z.infer<typeof resetUserDataSchema>;
