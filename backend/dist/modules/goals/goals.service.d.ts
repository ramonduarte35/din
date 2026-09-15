import { CreateGoalInput, UpdateGoalInput, DepositGoalInput } from './goals.schemas.js';
export declare class GoalsService {
    listGoals(userId: string): Promise<{
        target_amount: number;
        current_amount: number;
        progress: number;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        title: string;
        deadline: Date | null;
        is_completed: boolean;
    }[]>;
    createGoal(userId: string, data: CreateGoalInput): Promise<{
        target_amount: number;
        current_amount: number;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        title: string;
        deadline: Date | null;
        is_completed: boolean;
    }>;
    updateGoal(userId: string, goalId: string, data: UpdateGoalInput): Promise<{
        target_amount: number;
        current_amount: number;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        title: string;
        deadline: Date | null;
        is_completed: boolean;
    }>;
    depositGoal(userId: string, goalId: string, data: DepositGoalInput): Promise<{
        target_amount: number;
        current_amount: number;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        title: string;
        deadline: Date | null;
        is_completed: boolean;
    }>;
    deleteGoal(userId: string, goalId: string): Promise<{
        message: string;
    }>;
}
