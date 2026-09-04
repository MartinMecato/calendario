'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DAYS_OF_WEEK, MONTH_NAMES, CATEGORIES } from '@/lib/constants';
import { CalendarEvent } from '@/types';
import { formatDateToISO, getMonthMatrix, cn } from '@/lib/utils';

interface Props {
  currentDate: Date;
  selectedDate: string;
  events: CalendarEvent[];
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function MonthView({
  currentDate,
  selectedDate,
  events,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const matrix = getMonthMatrix(year, month);

  // Group events by date for fast lookup
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of events) {
      const list = map.get(evt.date) || [];
      list.push(evt);
      map.set(evt.date, list);
    }
    return map;
  }, [events]);

  const todayStr = formatDateToISO(new Date());

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">
            {MONTH_NAMES[month]} <span className="text-blue-600 font-extrabold">{year}</span>
          </h2>
          <button
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.short}
            className="py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
          >
            <span className="hidden sm:inline">{day.full}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {matrix.map((cell) => {
          const isSelected = cell.dateStr === selectedDate;
          const dayEvents = eventsByDate.get(cell.dateStr) || [];
          const hasEvents = dayEvents.length > 0;
          const hasPending = dayEvents.some((e) => !e.completed);

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={cn(
                'group relative flex flex-col items-center justify-between p-1 sm:p-2 min-h-[50px] sm:min-h-[70px] rounded-xl border transition-all text-left',
                // Month active vs outside
                cell.isCurrentMonth
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 border-transparent',
                // Selected state
                isSelected
                  ? 'ring-2 ring-blue-600 dark:ring-blue-500 border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                  : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              )}
            >
              {/* Day Number and Today badge */}
              <div className="w-full flex items-center justify-between">
                <span
                  className={cn(
                    'w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-colors',
                    cell.isToday
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isSelected
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : ''
                  )}
                >
                  {cell.dayNumber}
                </span>

                {/* Event count on desktop */}
                {hasEvents && (
                  <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event indicators dots/pills */}
              <div className="w-full flex flex-wrap gap-1 justify-center sm:justify-start mt-1">
                {/* On mobile: dots */}
                <div className="flex sm:hidden gap-0.5 justify-center">
                  {dayEvents.slice(0, 3).map((e, idx) => {
                    const cat = CATEGORIES[e.category] || CATEGORIES.otro;
                    return (
                      <span
                        key={idx}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          cat.dotColor,
                          e.completed && 'opacity-40'
                        )}
                      />
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                  )}
                </div>

                {/* On desktop: mini event pills */}
                <div className="hidden sm:flex flex-col w-full gap-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((e) => {
                    const cat = CATEGORIES[e.category] || CATEGORIES.otro;
                    return (
                      <div
                        key={e.id}
                        className={cn(
                          'truncate text-[10px] px-1.5 py-0.5 rounded font-medium border leading-tight',
                          cat.bgLight,
                          cat.textLight,
                          cat.border,
                          e.completed && 'line-through opacity-50'
                        )}
                      >
                        {e.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold px-1">
                      +{dayEvents.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
