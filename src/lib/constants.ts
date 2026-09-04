import { CategoryInfo, CategoryType, PriorityType } from '@/types';

export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  trabajo: {
    id: 'trabajo',
    label: 'Trabajo',
    color: 'bg-blue-500',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    textLight: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    color: 'bg-emerald-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    textLight: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  estudio: {
    id: 'estudio',
    label: 'Estudio',
    color: 'bg-purple-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    textLight: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    dotColor: 'bg-purple-500',
  },
  salud: {
    id: 'salud',
    label: 'Salud',
    color: 'bg-rose-500',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    textLight: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dotColor: 'bg-rose-500',
  },
  urgente: {
    id: 'urgente',
    label: 'Urgente',
    color: 'bg-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    textLight: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  otro: {
    id: 'otro',
    label: 'General / Otro',
    color: 'bg-slate-500',
    bgLight: 'bg-slate-50 dark:bg-slate-900/50',
    textLight: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    dotColor: 'bg-slate-500',
  },
};

export const PRIORITIES: Record<PriorityType, { label: string; badgeClass: string }> = {
  baja: {
    label: 'Baja',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  media: {
    label: 'Media',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  },
  alta: {
    label: 'Alta',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
  },
};

export const DAYS_OF_WEEK = [
  { short: 'Lun', full: 'Lunes' },
  { short: 'Mar', full: 'Martes' },
  { short: 'Mié', full: 'Miércoles' },
  { short: 'Jue', full: 'Jueves' },
  { short: 'Vie', full: 'Viernes' },
  { short: 'Sáb', full: 'Sábado' },
  { short: 'Dom', full: 'Domingo' },
];

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
