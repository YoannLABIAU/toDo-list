/**
 * Types de récurrence supportés.
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * Interface représentant une catégorie.
 */
export interface Category {
  id: number;
  name: string;
  color: string;
  user_id?: number | null;
  created_at?: string;
}

/**
 * Interface représentant une tâche avec ses métadonnées de catégorie et de récurrence.
 */
export interface Task {
  id: number;
  title: string;
  due_date: string | null;
  due_time?: string | null;
  completed: boolean;
  category_id: number | null;
  category_name?: string | null;
  category_color?: string | null;
  recurrence: RecurrenceType;
  recurrence_end_date?: string | null;
  has_generated_next?: number | boolean;
  user_id?: number | null;
  created_at: string;
  updated_at?: string;
  recurrence_generated?: boolean;
  recurrence_ended?: boolean;
  next_task?: Task;
}

/**
 * Interface générique de réponse API HTTP 200 normalisée.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data?: T;
  error?: string;
}
