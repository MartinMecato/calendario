import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteEvent, updateEvent } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = params;
  try {
    const updates = await req.json();
    const updated = await updateEvent(user.id, id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Evento no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar evento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = params;
  try {
    const deleted = await deleteEvent(user.id, id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Evento eliminado' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar evento' },
      { status: 500 }
    );
  }
}
