import { z } from 'zod';

export const createAffiliateBannerSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url('URL da imagem inválida').optional().nullable().or(z.literal('')),
  badge_text: z.string().max(50).optional().nullable(),
  cta_text: z.string().min(1).max(50).default('Saiba Mais'),
  target_url: z.string().url('URL de destino inválida'),
  placement: z.enum(['DASHBOARD', 'TRANSACTIONS', 'BILLS', 'GLOBAL']).default('DASHBOARD'),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export type CreateAffiliateBannerInput = z.infer<typeof createAffiliateBannerSchema>;

export const updateAffiliateBannerSchema = createAffiliateBannerSchema.partial();

export type UpdateAffiliateBannerInput = z.infer<typeof updateAffiliateBannerSchema>;

export const queryAffiliateBannersSchema = z.object({
  placement: z.enum(['ALL', 'DASHBOARD', 'TRANSACTIONS', 'BILLS', 'GLOBAL']).default('ALL'),
  is_active: z.enum(['ALL', 'TRUE', 'FALSE']).default('ALL'),
});

export type QueryAffiliateBannersInput = z.infer<typeof queryAffiliateBannersSchema>;
