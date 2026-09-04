'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MonthView } from '@/components/Calendar/MonthView';
import { DayAgenda } from '@/components/Calendar/DayAgenda';
import { EventModal } from '@/components/Calendar/EventModal';
import { MobileNav } from '@/components/MobileNav';
import { useAuth } from '@/components/AuthContext';
import { CalendarEvent, CategoryType } from '@/types';
import { formatDateToISO } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Plus, Search, Sparkles } from 'lucide-react';

export default function CalendarDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Date States
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToISO(new Date()));

  // Events & Filters
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile View Tab ('month' or 'agenda')
  const [mobileTab, setMobileTab] = useState<'month' | 'agenda'>('month');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingEvents(true);
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoadingEvents(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDateToISO(today));
    setMobileTab('agenda');
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    // On mobile, auto-switch to agenda when tapping a day
    setMobileTab('agenda');
  };

  // Event Action Handlers
  const handleOpenNewEvent = (date?: string) => {
    setEditingEvent(null);
    if (date) setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    if (editingEvent) {
      // Update
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) throw new Error('Error al actualizar la actividad');
      const data = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? data.event : e)));
    } else {
      // Create
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) throw new Error('Error al crear la actividad');
      const data = await res.json();
      setEvents((prev) => [...prev, data.event]);
    }
  };

  const handleToggleComplete = async (eventId: string, currentCompleted: boolean) => {
    // Optimistic UI update
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, completed: !currentCompleted } : e))
    );

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchEvents();
      }
    } catch (err) {
      fetchEvents();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Optimistic UI update
    setEvents((prev) => prev.filter((e) => e.id !== eventId));

    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) {
        fetchEvents();
      }
    } catch (err) {
      fetchEvents();
    }
  };

  // Filtered events
  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(query);
      const matchDesc = e.description?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Events for the selected date
  const selectedDayEvents = filteredEvents.filter((e) => e.date === selectedDate);

  // Overall Statistics
  const todayISO = formatDateToISO(new Date());
  const todayTasks = events.filter((e) => e.date === todayISO);
  const totalCompletedToday = todayTasks.filter((e) => e.completed).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Cargando tu calendario...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 pb-20 sm:pb-8">
      {/* Top Navigation */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex items-center bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setMobileTab('month')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'month'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Vista Mes
          </button>
          <button
            onClick={() => setMobileTab('agenda')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Tareas del Día ({selectedDayEvents.length})
          </button>
        </div>

        {/* Search Bar & Quick Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar entre tus actividades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Hoy: {todayTasks.length} {todayTasks.length === 1 ? 'tarea' : 'tareas'}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{totalCompletedToday} completadas</span>
            </div>
          </div>
        </div>

        {/* Content Grid: Left Month Calendar, Right Day Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Month Calendar (visible on desktop or if mobileTab is 'month') */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              mobileTab === 'agenda' ? 'hidden lg:block' : 'block'
            }`}
          >
            <MonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={filteredEvents}
              onSelectDate={handleSelectDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />

            {/* Category Legend (Desktop) */}
            <div className="hidden sm:flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl text-xs text-slate-600 dark:text-slate-400 shadow-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Categorías:</span>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor}`} />
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Day Agenda (visible on desktop or if mobileTab is 'agenda') */}
          <div
            className={`lg:col-span-5 ${
              mobileTab === 'month' ? 'hidden lg:block' : 'block'
            }`}
          >
            <DayAgenda
              selectedDate={selectedDate}
              events={selectedDayEvents}
              onToggleComplete={handleToggleComplete}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddNewEvent={() => handleOpenNewEvent(selectedDate)}
            />
          </div>
        </div>
      </main>

      {/* Floating Action Button (Desktop & Tablet) */}
      <button
        onClick={() => handleOpenNewEvent(selectedDate)}
        className="hidden sm:flex fixed bottom-6 right-6 z-30 items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 font-semibold text-sm transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>Nueva Actividad</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
        onToday={handleToday}
        onOpenNewEvent={() => handleOpenNewEvent(selectedDate)}
      />

      {/* Event Modal / Bottom Sheet */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialDate={selectedDate}
        initialEvent={editingEvent}
      />
    </div>
  );
}
