import { api } from './client';

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  created_at?: string;
}

export async function getCategoriesRequest(): Promise<Category[]> {
  const { data } = await api.get<{ categories: Category[] }>('/categories');
  return data.categories;
}

export async function createCategoryRequest(category: {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
}): Promise<Category> {
  const { data } = await api.post<{ category: Category }>('/categories', category);
  return data.category;
}

export async function deleteCategoryRequest(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export const fetchCategories = getCategoriesRequest;

