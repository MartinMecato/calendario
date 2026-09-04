import { NextRequest, NextResponse } from 'next/server';
import { getAllEventsByDate, findUserById, markReminderSent } from '@/lib/db';
import { sendReminderEmail } from '@/lib/email';
import { formatDateToISO } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateToISO(tomorrow);

    console.log(`[CRON RECORDATORIOS] Buscando actividades para mañana: ${tomorrowStr}`);

    // Fetch all events across the database for tomorrow
    const eventsTomorrow = await getAllEventsByDate(tomorrowStr);

    let sentCount = 0;
    const errors: string[] = [];

    for (const event of eventsTomorrow) {
      // Check if reminder is enabled and not completed and not already sent
      if (event.completed) continue;
      if (event.emailReminder === false) continue;
      if (event.reminderSent) continue;

      const user = await findUserById(event.userId);
      if (!user || !user.email) continue;

      const result = await sendReminderEmail({
        to: user.email,
        userName: user.name || 'Usuario',
        event,
      });

      if (result.success) {
        await markReminderSent(event.id);
        sentCount++;
      } else if (result.error) {
        errors.push(`Error enviando a ${user.email} para "${event.title}": ${result.error}`);
      }
    }

    return NextResponse.json({
      success: true,
      targetDate: tomorrowStr,
      eventsFound: eventsTomorrow.length,
      remindersSent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error en cron de recordatorios:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno en cron de recordatorios' },
      { status: 500 }
    );
  }
}
