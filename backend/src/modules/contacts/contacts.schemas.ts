import { z } from 'zod';
import { ContactType } from '@prisma/client';

export const createContactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
  type: z.nativeEnum(ContactType).default('PF'),
  document: z.string().max(20).optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateContactSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  type: z.nativeEnum(ContactType).optional(),
  document: z.string().max(20).optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const listContactsQuerySchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(ContactType).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
  _t: z.any().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQueryInput = z.infer<typeof listContactsQuerySchema>;
