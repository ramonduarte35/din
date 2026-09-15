import { z } from 'zod';
export declare const checkoutSchema: z.ZodObject<{
    plan_cycle: z.ZodDefault<z.ZodEnum<["MONTHLY", "YEARLY"]>>;
    billing_type: z.ZodDefault<z.ZodEnum<["PIX", "CREDIT_CARD", "BOLETO", "UNDEFINED"]>>;
    cpf_cnpj: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    billing_type: "CREDIT_CARD" | "PIX" | "BOLETO" | "UNDEFINED";
    plan_cycle: "MONTHLY" | "YEARLY";
    phone?: string | undefined;
    cpf_cnpj?: string | undefined;
}, {
    phone?: string | undefined;
    billing_type?: "CREDIT_CARD" | "PIX" | "BOLETO" | "UNDEFINED" | undefined;
    plan_cycle?: "MONTHLY" | "YEARLY" | undefined;
    cpf_cnpj?: string | undefined;
}>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export declare const asaasWebhookSchema: z.ZodObject<{
    event: z.ZodString;
    payment: z.ZodObject<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    event: z.ZodString;
    payment: z.ZodObject<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    event: z.ZodString;
    payment: z.ZodObject<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        customer: z.ZodOptional<z.ZodString>;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        value: z.ZodNumber;
        netValue: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        billingType: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        paymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        clientPaymentDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        invoiceUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankSlipUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">>;
}, z.ZodTypeAny, "passthrough">>;
export type AsaasWebhookPayload = z.infer<typeof asaasWebhookSchema>;
