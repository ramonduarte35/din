import { z } from 'zod';
export declare const createGoalSchema: z.ZodObject<{
    title: z.ZodString;
    target_amount: z.ZodNumber;
    current_amount: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    deadline: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    icon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    color: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    color: string;
    icon: string;
    title: string;
    target_amount: number;
    current_amount: number;
    deadline?: string | Date | null | undefined;
}, {
    title: string;
    target_amount: number;
    color?: string | undefined;
    icon?: string | undefined;
    current_amount?: number | undefined;
    deadline?: string | Date | null | undefined;
}>;
export declare const updateGoalSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    target_amount: z.ZodOptional<z.ZodNumber>;
    current_amount: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    deadline: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>>;
    icon: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    color: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
} & {
    is_completed: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    color?: string | undefined;
    icon?: string | undefined;
    title?: string | undefined;
    target_amount?: number | undefined;
    current_amount?: number | undefined;
    deadline?: string | Date | null | undefined;
    is_completed?: boolean | undefined;
}, {
    color?: string | undefined;
    icon?: string | undefined;
    title?: string | undefined;
    target_amount?: number | undefined;
    current_amount?: number | undefined;
    deadline?: string | Date | null | undefined;
    is_completed?: boolean | undefined;
}>;
export declare const depositGoalSchema: z.ZodObject<{
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: number;
}, {
    amount: number;
}>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type DepositGoalInput = z.infer<typeof depositGoalSchema>;
