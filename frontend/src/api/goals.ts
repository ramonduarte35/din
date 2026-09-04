import { api } from './client';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  progress: number;
  created_at: string;
}

export async function getGoalsRequest(): Promise<Goal[]> {
  const { data } = await api.get<{ goals: Goal[] }>('/goals');
  return data.goals;
}

export async function createGoalRequest(payload: {
  title: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
  icon?: string;
  color?: string;
}): Promise<Goal> {
  const { data } = await api.post<{ goal: Goal }>('/goals', payload);
  return data.goal;
}

export async function updateGoalRequest(
  id: string,
  payload: Partial<{
    title: string;
    target_amount: number;
    current_amount: number;
    deadline?: string | null;
    icon?: string;
    color?: string;
    is_completed?: boolean;
  }>
): Promise<Goal> {
  const { data } = await api.put<{ goal: Goal }>(`/goals/${id}`, payload);
  return data.goal;
}

export async function depositGoalRequest(id: string, amount: number): Promise<Goal> {
  const { data } = await api.post<{ goal: Goal }>(`/goals/${id}/deposit`, { amount });
  return data.goal;
}

export async function deleteGoalRequest(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}
