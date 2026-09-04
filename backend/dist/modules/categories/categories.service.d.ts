import { CreateCategoryInput } from './categories.schemas.js';
export declare class CategoriesService {
    listCategories(userId: string): Promise<{
        type: import("@prisma/client").$Enums.CategoryType;
        name: string;
        id: string;
        created_at: Date;
        user_id: string | null;
        color: string;
        icon: string;
    }[]>;
    createCategory(userId: string, data: CreateCategoryInput): Promise<{
        type: import("@prisma/client").$Enums.CategoryType;
        name: string;
        id: string;
        created_at: Date;
        user_id: string | null;
        color: string;
        icon: string;
    }>;
    updateCategory(userId: string, categoryId: string, data: Partial<CreateCategoryInput>): Promise<{
        type: import("@prisma/client").$Enums.CategoryType;
        name: string;
        id: string;
        created_at: Date;
        user_id: string | null;
        color: string;
        icon: string;
    }>;
    deleteCategory(userId: string, categoryId: string): Promise<{
        message: string;
    }>;
}
