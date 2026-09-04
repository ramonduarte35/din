"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    type: zod_1.z.nativeEnum(client_1.CategoryType),
    icon: zod_1.z.string().optional().default('Tag'),
    color: zod_1.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor hex inválida').optional().default('#64748b'),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
