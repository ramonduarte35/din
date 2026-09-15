import { z } from 'zod';
export declare const listBudgetsQuerySchema: z.ZodObject<{
    month: z.ZodOptional<z.ZodNumber>;
    year: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    month?: number | undefined;
    year?: number | undefined;
}, {
    month?: number | undefined;
    year?: number | undefined;
}>;
export declare const upsertBudgetSchema: z.ZodObject<{
    category_id: z.ZodString;
    amount: z.ZodNumber;
    month: z.ZodNumber;
    year: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category_id: string;
    amount: number;
    month: number;
    year: number;
}, {
    category_id: string;
    amount: number;
    month: number;
    year: number;
}>;
export declare const updateBudgetSchema: z.ZodObject<{
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: number;
}, {
    amount: number;
}>;
export declare const copyBudgetsSchema: z.ZodObject<{
    target_month: z.ZodNumber;
    target_year: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    target_month: number;
    target_year: number;
}, {
    target_month: number;
    target_year: number;
}>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CopyBudgetsInput = z.infer<typeof copyBudgetsSchema>;
