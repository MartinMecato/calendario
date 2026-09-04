import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendReminderEmail } from '@/lib/email';
import { formatDateToISO } from '@/lib/utils';
import { CalendarEvent } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión para probar el envío de correo.' }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateToISO(tomorrow);

    const testEvent: CalendarEvent = {
      id: 'test_evt',
      userId: user.id,
      title: 'Prueba de Recordatorio de Actividad ✨',
      description: '¡Este es un correo de prueba! Tus recordatorios te llegarán así 1 día antes de cada cosa que anotes.',
      date: tomorrowStr,
      startTime: '10:00',
      endTime: '11:00',
      isAllDay: false,
      category: 'personal',
      priority: 'alta',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await sendReminderEmail({
      to: user.email,
      userName: user.name,
      event: testEvent,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'No se pudo enviar el correo de prueba.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `¡Correo de prueba enviado con éxito a ${user.email}!`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al procesar la solicitud.',
    }, { status: 500 });
  }
}
