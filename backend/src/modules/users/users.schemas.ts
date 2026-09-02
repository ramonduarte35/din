import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  phone_number: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().optional(),
  new_password: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});


export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

