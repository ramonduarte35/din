import { RegisterInput, LoginInput } from './auth.schemas.js';
export declare class AuthService {
    private googleClient;
    constructor();
    register(data: RegisterInput): Promise<{
        has_password: boolean;
        name: string;
        id: string;
        email: string;
        phone_number: string | null;
        avatar_url: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
        created_at: Date;
    }>;
    login(data: LoginInput): Promise<{
        id: string;
        name: string;
        email: string;
        phone_number: string | null;
        avatar_url: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
        has_password: boolean;
    }>;
    googleLogin(idToken: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone_number: string | null;
        avatar_url: string | null;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        role: import("@prisma/client").$Enums.Role;
        has_password: boolean;
    }>;
}
