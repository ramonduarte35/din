import { z } from 'zod';
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodNativeEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
    }>;
    icon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    color: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "INCOME" | "EXPENSE";
    name: string;
    color: string;
    icon: string;
}, {
    type: "INCOME" | "EXPENSE";
    name: string;
    color?: string | undefined;
    icon?: string | undefined;
}>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
    }>>;
    icon: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    color: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    type?: "INCOME" | "EXPENSE" | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}, {
    type?: "INCOME" | "EXPENSE" | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
