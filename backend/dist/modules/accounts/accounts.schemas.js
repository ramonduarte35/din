"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountSchema = exports.createAccountSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'O nome da conta é obrigatório').max(50, 'Nome muito longo'),
    type: zod_1.z.nativeEnum(client_1.AccountType).default(client_1.AccountType.CHECKING),
    color: zod_1.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor hexadecimal inválida').default('#10b981'),
    icon: zod_1.z.string().default('Landmark'),
    initial_balance: zod_1.z.number().default(0),
    is_default: zod_1.z.boolean().default(false),
});
exports.updateAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50).optional(),
    type: zod_1.z.nativeEnum(client_1.AccountType).optional(),
    color: zod_1.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
    icon: zod_1.z.string().optional(),
    initial_balance: zod_1.z.number().optional(),
    is_default: zod_1.z.boolean().optional(),
});
