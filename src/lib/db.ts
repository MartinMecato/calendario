import fs from 'fs';
import path from 'path';
import { CalendarEvent, User } from '@/types';
import { formatDateToISO } from './utils';

interface DbData {
  users: Array<User & { passwordHash: string }>;
  events: CalendarEvent[];
}

import os from 'os';

function getDataFilePath(): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'calendar.json');
  }
  return path.join(process.cwd(), '.data', 'calendar.json');
}

// In-memory fallback for environments with read-only filesystems
let memoryStore: DbData = {
  users: [],
  events: [],
};

function ensureDataFile(): DbData {
  const filePath = getDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      memoryStore = parsed;
      return parsed;
    } else {
      saveData(memoryStore);
      return memoryStore;
    }
  } catch (err) {
    return memoryStore;
  }
}

function saveData(data: DbData) {
  memoryStore = data;
  const filePath = getDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Fallback in memory
  }
}

// User methods
export async function findUserByEmail(email: string) {
  const data = ensureDataFile();
  return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string) {
  const data = ensureDataFile();
  const user = data.users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function getDeterministicUserId(email: string): string {
  const clean = email.toLowerCase().replace(/[^a-z0-9]/g, '');
  return 'usr_' + (clean.length > 0 ? clean.slice(0, 16) : 'user');
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const data = ensureDataFile();
  const id = getDeterministicUserId(email);
  const now = new Date().toISOString();
  
  // Update if already exists or push new
  const existingIdx = data.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingIdx !== -1) {
    data.users[existingIdx].name = name;
    data.users[existingIdx].passwordHash = passwordHash;
    saveData(data);
    const { passwordHash: _, ...safeUser } = data.users[existingIdx];
    return safeUser;
  }

  const newUser = {
    id,
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: now,
  };

  data.users.push(newUser);

  // Check if events already exist for this user id (e.g. from previous sessions)
  const hasEvents = data.events.some((e) => e.userId === id);
  if (hasEvents) {
    saveData(data);
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  // Seed friendly starter tasks only for brand new users
  const today = new Date();
  const todayStr = formatDateToISO(today);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateToISO(tomorrow);

  const starterEvents: CalendarEvent[] = [
    {
      id: 'evt_' + Math.random().toString(36).substring(2, 11),
      userId: id,
      title: '¡Bienvenido a tu nuevo calendario! 🎉',
      description: 'Explora tu agenda, agrega tus pendientes y organízate fácilmente.',
      date: todayStr,
      startTime: '09:00',
      endTime: '10:00',
      isAllDay: false,
      category: 'personal',
      priority: 'alta',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'evt_' + Math.random().toString(36).substring(2, 11),
      userId: id,
      title: 'Planificar metas y tareas de la semana 📝',
      description: 'Anota aquí todo lo que tienes que hacer hoy y en los próximos días.',
      date: todayStr,
      startTime: '14:00',
      endTime: '15:30',
      isAllDay: false,
      category: 'trabajo',
      priority: 'media',
      completed: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'evt_' + Math.random().toString(36).substring(2, 11),
      userId: id,
      title: 'Revisión y paseo o deporte 🏃‍♂️',
      description: 'Tomar un descanso para cuidar la salud y despejar la mente.',
      date: tomorrowStr,
      startTime: '18:00',
      endTime: '19:00',
      isAllDay: false,
      category: 'salud',
      priority: 'media',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  data.events.push(...starterEvents);
  saveData(data);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

// Event methods
export async function getEventsByUserId(userId: string, date?: string): Promise<CalendarEvent[]> {
  const data = ensureDataFile();
  let userEvents = data.events.filter((e) => e.userId === userId);
  
  if (date) {
    userEvents = userEvents.filter((e) => e.date === date);
  }

  // Sort by startTime or all-day
  return userEvents.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
  });
}

export async function createEvent(
  userId: string,
  eventData: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<CalendarEvent> {
  const data = ensureDataFile();
  const id = 'evt_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  const newEvent: CalendarEvent = {
    ...eventData,
    id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  data.events.push(newEvent);
  saveData(data);
  return newEvent;
}

export async function updateEvent(
  userId: string,
  eventId: string,
  updates: Partial<Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>>
): Promise<CalendarEvent | null> {
  const data = ensureDataFile();
  const index = data.events.findIndex((e) => e.id === eventId && e.userId === userId);
  if (index === -1) return null;

  const existing = data.events[index];
  const updatedEvent: CalendarEvent = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  data.events[index] = updatedEvent;
  saveData(data);
  return updatedEvent;
}

export async function deleteEvent(userId: string, eventId: string): Promise<boolean> {
  const data = ensureDataFile();
  const initialLength = data.events.length;
  data.events = data.events.filter((e) => !(e.id === eventId && e.userId === userId));
  
  if (data.events.length !== initialLength) {
    saveData(data);
    return true;
  }
  return false;
}

export async function getAllEventsByDate(dateStr: string): Promise<CalendarEvent[]> {
  const data = ensureDataFile();
  return data.events.filter((e) => e.date === dateStr);
}

export async function markReminderSent(eventId: string): Promise<void> {
  const data = ensureDataFile();
  const event = data.events.find((e) => e.id === eventId);
  if (event) {
    event.reminderSent = true;
    event.updatedAt = new Date().toISOString();
    saveData(data);
  }
}

