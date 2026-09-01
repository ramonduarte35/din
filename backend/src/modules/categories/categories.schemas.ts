import { z } from 'zod';
import { CategoryType } from '@prisma/client';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  type: z.nativeEnum(CategoryType),
  icon: z.string().optional().default('Tag'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor hex inválida').optional().default('#64748b'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
