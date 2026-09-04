'use client';

import React from 'react';
import { Calendar, Plus, ListTodo, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  activeTab: 'month' | 'agenda';
  onChangeTab: (tab: 'month' | 'agenda') => void;
  onToday: () => void;
  onOpenNewEvent: () => void;
}

export function MobileNav({
  activeTab,
  onChangeTab,
  onToday,
  onOpenNewEvent,
}: Props) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around">
      {/* Mes / Calendario */}
      <button
        onClick={() => onChangeTab('month')}
        className={cn(
          'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
          activeTab === 'month'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-400 dark:text-slate-500'
        )}
      >
        <CalendarDays className="w-5 h-5" />
        <span>Mes</span>
      </button>

      {/* Floating Add Task Button */}
      <button
        onClick={onOpenNewEvent}
        className="-mt-5 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all"
        title="Nueva tarea"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Agenda / Día */}
      <button
        onClick={() => onChangeTab('agenda')}
        className={cn(
          'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
          activeTab === 'agenda'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-400 dark:text-slate-500'
        )}
      >
        <ListTodo className="w-5 h-5" />
        <span>Mi Día</span>
      </button>

      {/* Hoy */}
      <button
        onClick={onToday}
        className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors"
      >
        <Calendar className="w-5 h-5" />
        <span>Hoy</span>
      </button>
    </div>
  );
}
