import { z } from 'zod';

export const manageUserSubscriptionSchema = z.object({
  subscription_tier: z.enum(['FREE', 'PRO']),
  subscription_status: z.enum(['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED']).optional(),
  // Duração em dias a partir de agora, ou data ISO específica, ou null para vitalício
  days_to_add: z.number().int().min(1).max(3650).optional(),
  expires_at: z.string().datetime().nullable().optional(),
  is_lifetime: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export type ManageUserSubscriptionInput = z.infer<typeof manageUserSubscriptionSchema>;

export const queryUsersSubscriptionSchema = z.object({
  search: z.string().optional(),
  tier: z.enum(['ALL', 'FREE', 'PRO']).default('ALL'),
  status: z.enum(['ALL', 'ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED']).default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryUsersSubscriptionInput = z.infer<typeof queryUsersSubscriptionSchema>;
