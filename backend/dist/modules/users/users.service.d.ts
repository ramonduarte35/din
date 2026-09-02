import { UpdateProfileInput, ChangePasswordInput } from './users.schemas.js';
export declare class UsersService {
    getProfile(userId: string): Promise<{
        has_password: boolean;
        name: string;
        id: string;
        email: string;
        phone_number: string | null;
        avatar_url: string | null;
        google_id: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
        created_at: Date;
        updated_at: Date;
        _count: {
            transactions: number;
        };
    }>;
    updateProfile(userId: string, data: UpdateProfileInput): Promise<{
        has_password: boolean;
        name: string;
        id: string;
        email: string;
        phone_number: string | null;
        avatar_url: string | null;
        google_id: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
        updated_at: Date;
    }>;
    changePassword(userId: string, data: ChangePasswordInput): Promise<{
        message: string;
    }>;
}
