import { z } from 'zod';
export declare const aiExtractedTransactionSchema: z.ZodObject<{
    type: z.ZodEnum<["INCOME", "EXPENSE"]>;
    amount: z.ZodNumber;
    description: z.ZodString;
    suggested_category: z.ZodString;
    date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    suggested_category: string;
    date?: string | undefined;
}, {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    suggested_category: string;
    date?: string | undefined;
}>;
export declare const aiExtractionResponseSchema: z.ZodObject<{
    intent: z.ZodEnum<["transaction", "balance_query", "unknown"]>;
    query_period: z.ZodOptional<z.ZodEnum<["current_month", "today", "all_time"]>>;
    transactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["INCOME", "EXPENSE"]>;
        amount: z.ZodNumber;
        description: z.ZodString;
        suggested_category: z.ZodString;
        date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
    }, {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    intent: "transaction" | "unknown" | "balance_query";
    transactions?: {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
    }[] | undefined;
    query_period?: "current_month" | "today" | "all_time" | undefined;
}, {
    intent: "transaction" | "unknown" | "balance_query";
    transactions?: {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
    }[] | undefined;
    query_period?: "current_month" | "today" | "all_time" | undefined;
}>;
export type AIExtractionResponse = z.infer<typeof aiExtractionResponseSchema>;
export type AIExtractedTransaction = z.infer<typeof aiExtractedTransactionSchema>;
