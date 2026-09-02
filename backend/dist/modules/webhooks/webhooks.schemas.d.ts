import { z } from 'zod';
export declare const aiExtractedTransactionSchema: z.ZodObject<{
    type: z.ZodEnum<["INCOME", "EXPENSE"]>;
    amount: z.ZodNumber;
    description: z.ZodString;
    suggested_category: z.ZodString;
    suggested_account: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    suggested_category: string;
    date?: string | undefined;
    suggested_account?: string | undefined;
}, {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    suggested_category: string;
    date?: string | undefined;
    suggested_account?: string | undefined;
}>;
export declare const aiExtractedBillSchema: z.ZodObject<{
    description: z.ZodString;
    amount: z.ZodNumber;
    due_date: z.ZodString;
    suggested_category: z.ZodOptional<z.ZodString>;
    barcode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    amount: number;
    due_date: string;
    barcode?: string | undefined;
    notes?: string | undefined;
    suggested_category?: string | undefined;
}, {
    description: string;
    amount: number;
    due_date: string;
    barcode?: string | undefined;
    notes?: string | undefined;
    suggested_category?: string | undefined;
}>;
export declare const aiExtractedPayBillSchema: z.ZodObject<{
    search_term: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    suggested_account: z.ZodOptional<z.ZodString>;
    paid_date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount?: number | undefined;
    paid_date?: string | undefined;
    suggested_account?: string | undefined;
    search_term?: string | undefined;
}, {
    amount?: number | undefined;
    paid_date?: string | undefined;
    suggested_account?: string | undefined;
    search_term?: string | undefined;
}>;
export declare const aiExtractionResponseSchema: z.ZodObject<{
    intent: z.ZodEnum<["transaction", "balance_query", "register_bill", "query_bills", "pay_bill", "unknown"]>;
    query_period: z.ZodOptional<z.ZodEnum<["current_month", "today", "all_time", "upcoming_week"]>>;
    query_account: z.ZodOptional<z.ZodString>;
    transactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["INCOME", "EXPENSE"]>;
        amount: z.ZodNumber;
        description: z.ZodString;
        suggested_category: z.ZodString;
        suggested_account: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
        suggested_account?: string | undefined;
    }, {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
        suggested_account?: string | undefined;
    }>, "many">>;
    bill_data: z.ZodOptional<z.ZodObject<{
        description: z.ZodString;
        amount: z.ZodNumber;
        due_date: z.ZodString;
        suggested_category: z.ZodOptional<z.ZodString>;
        barcode: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        amount: number;
        due_date: string;
        barcode?: string | undefined;
        notes?: string | undefined;
        suggested_category?: string | undefined;
    }, {
        description: string;
        amount: number;
        due_date: string;
        barcode?: string | undefined;
        notes?: string | undefined;
        suggested_category?: string | undefined;
    }>>;
    pay_bill_data: z.ZodOptional<z.ZodObject<{
        search_term: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        suggested_account: z.ZodOptional<z.ZodString>;
        paid_date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        amount?: number | undefined;
        paid_date?: string | undefined;
        suggested_account?: string | undefined;
        search_term?: string | undefined;
    }, {
        amount?: number | undefined;
        paid_date?: string | undefined;
        suggested_account?: string | undefined;
        search_term?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    intent: "transaction" | "unknown" | "balance_query" | "register_bill" | "query_bills" | "pay_bill";
    transactions?: {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
        suggested_account?: string | undefined;
    }[] | undefined;
    query_period?: "current_month" | "today" | "all_time" | "upcoming_week" | undefined;
    query_account?: string | undefined;
    bill_data?: {
        description: string;
        amount: number;
        due_date: string;
        barcode?: string | undefined;
        notes?: string | undefined;
        suggested_category?: string | undefined;
    } | undefined;
    pay_bill_data?: {
        amount?: number | undefined;
        paid_date?: string | undefined;
        suggested_account?: string | undefined;
        search_term?: string | undefined;
    } | undefined;
}, {
    intent: "transaction" | "unknown" | "balance_query" | "register_bill" | "query_bills" | "pay_bill";
    transactions?: {
        type: "INCOME" | "EXPENSE";
        description: string;
        amount: number;
        suggested_category: string;
        date?: string | undefined;
        suggested_account?: string | undefined;
    }[] | undefined;
    query_period?: "current_month" | "today" | "all_time" | "upcoming_week" | undefined;
    query_account?: string | undefined;
    bill_data?: {
        description: string;
        amount: number;
        due_date: string;
        barcode?: string | undefined;
        notes?: string | undefined;
        suggested_category?: string | undefined;
    } | undefined;
    pay_bill_data?: {
        amount?: number | undefined;
        paid_date?: string | undefined;
        suggested_account?: string | undefined;
        search_term?: string | undefined;
    } | undefined;
}>;
export type AIExtractionResponse = z.infer<typeof aiExtractionResponseSchema>;
export type AIExtractedTransaction = z.infer<typeof aiExtractedTransactionSchema>;
export type AIExtractedBill = z.infer<typeof aiExtractedBillSchema>;
export type AIExtractedPayBill = z.infer<typeof aiExtractedPayBillSchema>;
