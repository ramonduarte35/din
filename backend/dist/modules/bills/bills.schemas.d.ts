import { z } from 'zod';
export declare const createBillSchema: z.ZodObject<{
    description: z.ZodString;
    amount: z.ZodNumber;
    due_date: z.ZodEffects<z.ZodString, string, string>;
    category_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    account_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    barcode: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    is_recurring: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description: string;
    amount: number;
    due_date: string;
    account_id?: string | null | undefined;
    category_id?: string | null | undefined;
    barcode?: string | null | undefined;
    notes?: string | null | undefined;
    is_recurring?: boolean | undefined;
}, {
    description: string;
    amount: number;
    due_date: string;
    account_id?: string | null | undefined;
    category_id?: string | null | undefined;
    barcode?: string | null | undefined;
    notes?: string | null | undefined;
    is_recurring?: boolean | undefined;
}>;
export declare const updateBillSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    due_date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    category_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    account_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    barcode: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    is_recurring: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        PAID: "PAID";
        OVERDUE: "OVERDUE";
        CANCELLED: "CANCELLED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | undefined;
    account_id?: string | null | undefined;
    category_id?: string | null | undefined;
    description?: string | undefined;
    amount?: number | undefined;
    due_date?: string | undefined;
    barcode?: string | null | undefined;
    notes?: string | null | undefined;
    is_recurring?: boolean | undefined;
}, {
    status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | undefined;
    account_id?: string | null | undefined;
    category_id?: string | null | undefined;
    description?: string | undefined;
    amount?: number | undefined;
    due_date?: string | undefined;
    barcode?: string | null | undefined;
    notes?: string | null | undefined;
    is_recurring?: boolean | undefined;
}>;
export declare const payBillSchema: z.ZodObject<{
    account_id: z.ZodString;
    paid_date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    account_id: string;
    amount?: number | undefined;
    paid_date?: string | undefined;
}, {
    account_id: string;
    amount?: number | undefined;
    paid_date?: string | undefined;
}>;
export declare const listBillsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        PAID: "PAID";
        OVERDUE: "OVERDUE";
        CANCELLED: "CANCELLED";
    }>>;
    start_due_date: z.ZodOptional<z.ZodString>;
    end_due_date: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    account_id: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    month: z.ZodOptional<z.ZodNumber>;
    year: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | undefined;
    search?: string | undefined;
    account_id?: string | undefined;
    category_id?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    start_due_date?: string | undefined;
    end_due_date?: string | undefined;
    month?: number | undefined;
    year?: number | undefined;
}, {
    status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | undefined;
    search?: string | undefined;
    account_id?: string | undefined;
    category_id?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    start_due_date?: string | undefined;
    end_due_date?: string | undefined;
    month?: number | undefined;
    year?: number | undefined;
}>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type PayBillInput = z.infer<typeof payBillSchema>;
export type ListBillsQueryInput = z.infer<typeof listBillsQuerySchema>;
