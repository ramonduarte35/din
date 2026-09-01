"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiExtractionResponseSchema = exports.aiExtractedTransactionSchema = void 0;
const zod_1 = require("zod");
// Schema para OpenAI Structured Outputs
exports.aiExtractedTransactionSchema = zod_1.z.object({
    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
    amount: zod_1.z.number().positive(),
    description: zod_1.z.string(),
    suggested_category: zod_1.z.string(),
    date: zod_1.z.string().optional(),
});
exports.aiExtractionResponseSchema = zod_1.z.object({
    intent: zod_1.z.enum(['transaction', 'balance_query', 'unknown']),
    query_period: zod_1.z.enum(['current_month', 'today', 'all_time']).optional(),
    transactions: zod_1.z.array(exports.aiExtractedTransactionSchema).optional(),
});
