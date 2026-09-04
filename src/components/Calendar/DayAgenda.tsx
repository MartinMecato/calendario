'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, MoreVertical, Edit2, Trash2, Calendar as CalendarIcon, Bell } from 'lucide-react';
import { CalendarEvent } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { PRIORITIES } from '@/lib/constants';
import { formatFriendlyDate, cn } from '@/lib/utils';

interface Props {
  selectedDate: string;
  events: CalendarEvent[];
  onToggleComplete: (eventId: string, currentCompleted: boolean) => Promise<void>;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onAddNewEvent: (date: string) => void;
}

export function DayAgenda({
  selectedDate,
  events,
  onToggleComplete,
  onEditEvent,
  onDeleteEvent,
  onAddNewEvent,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredEvents = events.filter((e) => {
    if (filter === 'pending') return !e.completed;
    if (filter === 'completed') return e.completed;
    return true;
  });

  const total = events.length;
  const completed = events.filter((e) => e.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Date Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
            {formatFriendlyDate(selectedDate)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {total === 0
              ? 'No tienes tareas programadas para este día.'
              : `${completed} de ${total} actividades completadas (${percent}%)`}
          </p>
        </div>

        <button
          onClick={() => onAddNewEvent(selectedDate)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Tarea</span>
        </button>
      </div>

      {/* Progress Bar if events exist */}
      {total > 0 && (
        <div className="pt-3 pb-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters (All, Pending, Completed) */}
      {total > 0 && (
        <div className="flex items-center gap-1.5 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1 rounded-lg transition-colors',
              filter === 'all'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            )}
          >
            Todas ({total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              'px-3 py-1 rounded-lg transition-colors',
              filter === 'pending'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            )}
          >
            Pendientes ({total - completed})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              'px-3 py-1 rounded-lg transition-colors',
              filter === 'completed'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            )}
          >
            Completadas ({completed})
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
        {filteredEvents.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {total === 0
                ? '¡Día libre o sin pendientes anotados!'
                : 'No hay actividades con este filtro.'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              {total === 0
                ? 'Haz clic en "Agregar Tarea" para planificar tus cosas de este día.'
                : 'Cambia el filtro arriba para ver todas tus tareas.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const priorityInfo = PRIORITIES[event.priority];
            return (
              <div
                key={event.id}
                className={cn(
                  'group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all',
                  event.completed
                    ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/80 opacity-75'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/70 hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-900'
                )}
              >
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleComplete(event.id, event.completed)}
                  className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                  title={event.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {event.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <CategoryBadge category={event.category} />
                    
                    {/* Time or All-day */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                      <Clock className="w-3 h-3" />
                      {event.isAllDay
                        ? 'Todo el día'
                        : `${event.startTime || '--:--'} ${event.endTime ? ` - ${event.endTime}` : ''}`}
                    </span>

                    {/* Priority */}
                    {event.priority !== 'media' && (
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded',
                          priorityInfo.badgeClass
                        )}
                      >
                        {priorityInfo.label}
                      </span>
                    )}

                    {/* Email Reminder Badge */}
                    {event.emailReminder !== false && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded font-medium"
                        title="Recordatorio por correo 1 día antes activado"
                      >
                        <Bell className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">1 día antes</span>
                      </span>
                    )}
                  </div>

                  <h3
                    className={cn(
                      'text-sm font-semibold text-slate-800 dark:text-slate-100 break-words',
                      event.completed && 'line-through text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {event.title}
                  </h3>

                  {event.description && (
                    <p
                      className={cn(
                        'text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2',
                        event.completed && 'line-through text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Quick action buttons */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditEvent(event)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Editar actividad"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(event.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
