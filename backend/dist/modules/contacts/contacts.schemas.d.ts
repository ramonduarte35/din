import { z } from 'zod';
export declare const createContactSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodNativeEnum<{
        PF: "PF";
        PJ: "PJ";
    }>>;
    document: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "PF" | "PJ";
    name: string;
    email?: string | null | undefined;
    notes?: string | null | undefined;
    document?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    name: string;
    type?: "PF" | "PJ" | undefined;
    email?: string | null | undefined;
    notes?: string | null | undefined;
    document?: string | null | undefined;
    phone?: string | null | undefined;
}>;
export declare const updateContactSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        PF: "PF";
        PJ: "PJ";
    }>>;
    document: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: "PF" | "PJ" | undefined;
    name?: string | undefined;
    email?: string | null | undefined;
    notes?: string | null | undefined;
    document?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    type?: "PF" | "PJ" | undefined;
    name?: string | undefined;
    email?: string | null | undefined;
    notes?: string | null | undefined;
    document?: string | null | undefined;
    phone?: string | null | undefined;
}>;
export declare const listContactsQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        PF: "PF";
        PJ: "PJ";
    }>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    _t: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    type?: "PF" | "PJ" | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    _t?: any;
}, {
    type?: "PF" | "PJ" | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    _t?: any;
}>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQueryInput = z.infer<typeof listContactsQuerySchema>;
