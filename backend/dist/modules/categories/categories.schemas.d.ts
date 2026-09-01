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
    icon: string;
    color: string;
}, {
    type: "INCOME" | "EXPENSE";
    name: string;
    icon?: string | undefined;
    color?: string | undefined;
}>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
