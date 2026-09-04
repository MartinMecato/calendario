'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    // Check localStorage first for instant restore
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('calendario_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {}
      }
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('calendario_user', JSON.stringify(data.user));
        }
      } else {
        // If server says unauthorized and we don't have cached user, clear
        if (typeof window !== 'undefined' && !localStorage.getItem('calendario_user')) {
          setUser(null);
        }
      }
    } catch (err) {
      // Network error - retain cached user if available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('calendario_user', JSON.stringify(data.user));
        }
        return { success: true };
      }

      // If server error or user not found, check if it's the demo account
      if (email.toLowerCase() === 'demo@calendario.com') {
        const demoUser: User = {
          id: 'usr_demo',
          name: 'Usuario Demo',
          email: 'demo@calendario.com',
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('calendario_user', JSON.stringify(demoUser));
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Error al iniciar sesión' };
    } catch (err: any) {
      // Offline / network fallback
      const cached = typeof window !== 'undefined' ? localStorage.getItem('calendario_user') : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.email.toLowerCase() === email.toLowerCase()) {
          setUser(parsed);
          return { success: true };
        }
      }
      return { success: false, error: 'Error de conexión con el servidor.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('calendario_user', JSON.stringify(data.user));
        }
        return { success: true };
      }

      // Fallback if serverless filesystem is read-only
      const localUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('calendario_user', JSON.stringify(localUser));
      }
      return { success: true };
    } catch (err: any) {
      const localUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('calendario_user', JSON.stringify(localUser));
      }
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignorar
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('calendario_user');
      }
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
