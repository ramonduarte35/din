import { RegisterInput, LoginInput } from './auth.schemas.js';
export declare class AuthService {
    register(data: RegisterInput): Promise<{
        name: string;
        id: string;
        email: string;
        phone_number: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
        created_at: Date;
    }>;
    login(data: LoginInput): Promise<{
        id: string;
        name: string;
        email: string;
        phone_number: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
