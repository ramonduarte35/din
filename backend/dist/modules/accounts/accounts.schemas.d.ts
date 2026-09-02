import { z } from 'zod';
export declare const createAccountSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodNativeEnum<{
        CHECKING: "CHECKING";
        SAVINGS: "SAVINGS";
        INVESTMENT: "INVESTMENT";
        CREDIT_CARD: "CREDIT_CARD";
        CASH: "CASH";
        OTHER: "OTHER";
    }>>;
    color: z.ZodDefault<z.ZodString>;
    icon: z.ZodDefault<z.ZodString>;
    initial_balance: z.ZodDefault<z.ZodNumber>;
    is_default: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "CASH" | "OTHER";
    name: string;
    color: string;
    icon: string;
    initial_balance: number;
    is_default: boolean;
}, {
    name: string;
    type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "CASH" | "OTHER" | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    initial_balance?: number | undefined;
    is_default?: boolean | undefined;
}>;
export declare const updateAccountSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        CHECKING: "CHECKING";
        SAVINGS: "SAVINGS";
        INVESTMENT: "INVESTMENT";
        CREDIT_CARD: "CREDIT_CARD";
        CASH: "CASH";
        OTHER: "OTHER";
    }>>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    initial_balance: z.ZodOptional<z.ZodNumber>;
    is_default: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "CASH" | "OTHER" | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    initial_balance?: number | undefined;
    is_default?: boolean | undefined;
}, {
    type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT_CARD" | "CASH" | "OTHER" | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    initial_balance?: number | undefined;
    is_default?: boolean | undefined;
}>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
