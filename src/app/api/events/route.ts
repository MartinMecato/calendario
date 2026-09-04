import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createEvent, getEventsByUserId } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || undefined;

  const events = await getEventsByUserId(user.id, date);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      isAllDay = false,
      category = 'otro',
      priority = 'media',
    } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'El título y la fecha son obligatorios.' },
        { status: 400 }
      );
    }

    const newEvent = await createEvent(user.id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      date,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      isAllDay,
      category,
      priority,
      completed: false,
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error al crear evento:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud.' },
      { status: 500 }
    );
  }
}
