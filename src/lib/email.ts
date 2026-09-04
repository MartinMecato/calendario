import { Resend } from 'resend';
import { CalendarEvent } from '@/types';
import { CATEGORIES } from './constants';
import { formatFriendlyDate } from './utils';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender in Resend free tier is onboarding@resend.dev
const FROM_EMAIL = process.env.RESEND_FROM || 'Mi Calendario <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://calendario-martin.vercel.app';

interface SendReminderOptions {
  to: string;
  userName: string;
  event: CalendarEvent;
}

export async function sendReminderEmail({ to, userName, event }: SendReminderOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log(`[SIMULACIÓN EMAIL] RESEND_API_KEY no configurada. Simulación de recordatorio enviado a: ${to} para evento: "${event.title}"`);
    return { success: true, id: 'simulated_no_key' };
  }

  const category = CATEGORIES[event.category] || CATEGORIES.otro;
  const friendlyDate = formatFriendlyDate(event.date);
  const timeText = event.isAllDay ? 'Todo el día' : `${event.startTime || '--:--'} ${event.endTime ? `- ${event.endTime}` : ''}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio: ${event.title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 32px; margin-bottom: 8px;">📅</div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Recordatorio para Mañana</h1>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Hola ${userName}, tienes una actividad programada</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px;">
            <div style="background-color: #f1f5f9; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <div style="margin-bottom: 8px;">
                <span style="display: inline-block; background-color: #e0e7ff; color: #3730a3; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 9999px; letter-spacing: 0.05em;">
                  ${category.label}
                </span>
                ${event.priority === 'alta' ? '<span style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 9999px; margin-left: 6px;">Prioridad Alta</span>' : ''}
              </div>

              <h2 style="margin: 8px 0; font-size: 18px; color: #1e293b; font-weight: 700; line-height: 1.3;">
                ${event.title}
              </h2>

              <div style="margin-top: 14px; font-size: 14px; color: #475569; display: flex; flex-direction: column; gap: 6px;">
                <div style="margin-bottom: 4px;">
                  🗓️ <strong>Fecha:</strong> ${friendlyDate}
                </div>
                <div style="margin-bottom: 4px;">
                  ⏰ <strong>Horario:</strong> ${timeText}
                </div>
                ${event.description ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 13px; color: #64748b;"><strong>Notas:</strong> ${event.description}</div>` : ''}
              </div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                Abrir Mi Calendario
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            Este correo es una notificación automática programada 1 día antes de tu evento.<br/>
            Puedes administrar tus actividades en cualquier momento en Mi Calendario.
          </div>

        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `🔔 Recordatorio: Mañana tienes "${event.title}"`,
      html,
    });

    if (error) {
      console.error('Error enviando email con Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Excepción al enviar email con Resend:', err);
    return { success: false, error: err.message || 'Error desconocido' };
  }
}
