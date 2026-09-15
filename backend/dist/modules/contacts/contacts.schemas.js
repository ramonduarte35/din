"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listContactsQuerySchema = exports.updateContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
    type: zod_1.z.nativeEnum(client_1.ContactType).default('PF'),
    document: zod_1.z.string().max(20).optional().nullable(),
    email: zod_1.z.string().email('E-mail inválido').optional().nullable(),
    phone: zod_1.z.string().max(20).optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
});
exports.updateContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255).optional(),
    type: zod_1.z.nativeEnum(client_1.ContactType).optional(),
    document: zod_1.z.string().max(20).optional().nullable(),
    email: zod_1.z.string().email('E-mail inválido').optional().nullable(),
    phone: zod_1.z.string().max(20).optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
});
exports.listContactsQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.ContactType).optional(),
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(200).optional(),
    _t: zod_1.z.any().optional(),
});
