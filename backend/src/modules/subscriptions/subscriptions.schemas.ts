import { z } from 'zod';

export const checkoutSchema = z.object({
  plan_cycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  billing_type: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO', 'UNDEFINED']).default('PIX'),
  cpf_cnpj: z.string().optional(),
  phone: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const asaasWebhookSchema = z.object({
  event: z.string(),
  payment: z.object({
    id: z.string(),
    customer: z.string().optional(),
    subscription: z.string().optional().nullable(),
    value: z.number(),
    netValue: z.number().optional().nullable(),
    billingType: z.string().optional(),
    status: z.string(),
    dueDate: z.string().optional().nullable(),
    paymentDate: z.string().optional().nullable(),
    clientPaymentDate: z.string().optional().nullable(),
    invoiceUrl: z.string().optional().nullable(),
    bankSlipUrl: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }).passthrough(),
}).passthrough();

export type AsaasWebhookPayload = z.infer<typeof asaasWebhookSchema>;
