"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asaasWebhookSchema = exports.checkoutSchema = void 0;
const zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    plan_cycle: zod_1.z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
    billing_type: zod_1.z.enum(['PIX', 'CREDIT_CARD', 'BOLETO', 'UNDEFINED']).optional().default('UNDEFINED'),
    cpf_cnpj: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
exports.asaasWebhookSchema = zod_1.z.object({
    event: zod_1.z.string(),
    payment: zod_1.z.object({
        id: zod_1.z.string(),
        customer: zod_1.z.string().optional(),
        subscription: zod_1.z.string().optional().nullable(),
        paymentLink: zod_1.z.string().optional().nullable(),
        externalReference: zod_1.z.string().optional().nullable(),
        value: zod_1.z.number(),
        netValue: zod_1.z.number().optional().nullable(),
        billingType: zod_1.z.string().optional(),
        status: zod_1.z.string(),
        dueDate: zod_1.z.string().optional().nullable(),
        paymentDate: zod_1.z.string().optional().nullable(),
        clientPaymentDate: zod_1.z.string().optional().nullable(),
        invoiceUrl: zod_1.z.string().optional().nullable(),
        bankSlipUrl: zod_1.z.string().optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
    }).passthrough(),
}).passthrough();
