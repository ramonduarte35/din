import { z } from 'zod';
export declare const createTransactionSchema: z.ZodObject<{
    description: z.ZodString;
    amount: z.ZodNumber;
    type: z.ZodNativeEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
    }>;
    category_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    date: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, "strip", z.ZodTypeAny, {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    category_id?: string | null | undefined;
    date?: string | Date | undefined;
}, {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    category_id?: string | null | undefined;
    date?: string | Date | undefined;
}>;
export declare const updateTransactionSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
    }>>;
    category_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    date: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, "strip", z.ZodTypeAny, {
    type?: "INCOME" | "EXPENSE" | undefined;
    category_id?: string | null | undefined;
    description?: string | undefined;
    amount?: number | undefined;
    date?: string | Date | undefined;
}, {
    type?: "INCOME" | "EXPENSE" | undefined;
    category_id?: string | null | undefined;
    description?: string | undefined;
    amount?: number | undefined;
    date?: string | Date | undefined;
}>;
export declare const queryTransactionsSchema: z.ZodObject<{
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
    }>>;
    category_id: z.ZodOptional<z.ZodString>;
    origin: z.ZodOptional<z.ZodNativeEnum<{
        MANUAL: "MANUAL";
        WHATSAPP_TEXT: "WHATSAPP_TEXT";
        WHATSAPP_AUDIO: "WHATSAPP_AUDIO";
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type?: "INCOME" | "EXPENSE" | undefined;
    search?: string | undefined;
    category_id?: string | undefined;
    origin?: "MANUAL" | "WHATSAPP_TEXT" | "WHATSAPP_AUDIO" | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
}, {
    type?: "INCOME" | "EXPENSE" | undefined;
    search?: string | undefined;
    category_id?: string | undefined;
    origin?: "MANUAL" | "WHATSAPP_TEXT" | "WHATSAPP_AUDIO" | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type QueryTransactionsInput = z.infer<typeof queryTransactionsSchema>;
