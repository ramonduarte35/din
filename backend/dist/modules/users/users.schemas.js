"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    phone_number: zod_1.z.string().optional().nullable(),
    theme: zod_1.z.enum(['dark', 'classic', 'emerald', 'midnight', 'minimalist', 'rose', 'light', 'purple']).optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    current_password: zod_1.z.string().optional(),
    new_password: zod_1.z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});
