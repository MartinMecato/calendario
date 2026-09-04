'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Sun, Moon, LogOut, User, Filter, Check, Bell } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { CATEGORIES } from '@/lib/constants';
import { CategoryType } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (cat: CategoryType | 'all') => void;
}

export function Navbar({ selectedCategory, onSelectCategory }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleTestEmail = async () => {
    try {
      setSendingTest(true);
      const res = await fetch('/api/reminders/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message || 'Correo de prueba enviado con éxito!'}`);
      } else {
        alert(`ℹ️ ${data.error || 'No se pudo enviar el correo de prueba. Verifica tu clave RESEND_API_KEY en Vercel.'}`);
      }
    } catch (err) {
      alert('Error de conexión al enviar correo de prueba.');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Mi Calendario
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Organizador y agenda personal
            </p>
          </div>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2">
          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all',
                selectedCategory !== 'all'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {selectedCategory === 'all'
                  ? 'Todas las categorías'
                  : CATEGORIES[selectedCategory]?.label}
              </span>
            </button>

            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Filtrar por categoría
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setShowFilterMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                  >
                    <span>Todas las categorías</span>
                    {selectedCategory === 'all' && (
                      <Check className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </button>

                  {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
                    const cat = CATEGORIES[catKey];
                    const isSelected = selectedCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        onClick={() => {
                          onSelectCategory(catKey);
                          setShowFilterMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn('w-2 h-2 rounded-full', cat.dotColor)}
                          />
                          <span>{cat.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Test Email Button */}
          {user && (
            <button
              onClick={handleTestEmail}
              disabled={sendingTest}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 dark:border-blue-900"
              title="Enviar recordatorio de prueba a tu email"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{sendingTest ? 'Enviando...' : 'Probar Correo'}</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cambiar tema"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Profile and Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                {user.name.slice(0, 2)}
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
