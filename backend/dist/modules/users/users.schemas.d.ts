import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone_number?: string | null | undefined;
}, {
    name?: string | undefined;
    phone_number?: string | null | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    current_password: z.ZodString;
    new_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    current_password: string;
    new_password: string;
}, {
    current_password: string;
    new_password: string;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
