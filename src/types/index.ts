export type CategoryType = 'trabajo' | 'personal' | 'estudio' | 'salud' | 'urgente' | 'otro';

export type PriorityType = 'baja' | 'media' | 'alta';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  isAllDay: boolean;
  category: CategoryType;
  priority: PriorityType;
  completed: boolean;
  emailReminder?: boolean;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  color: string; // Tailwind class or hex
  bgLight: string;
  textLight: string;
  border: string;
  dotColor: string;
}

export interface DayTaskSummary {
  total: number;
  completed: number;
  pending: number;
  categories: CategoryType[];
}
