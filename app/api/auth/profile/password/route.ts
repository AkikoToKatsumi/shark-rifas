import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.participant?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // Get user from DB to verify current password
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('participants')
      .select('password_hash')
      .eq('id', session.participant.id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({ password_hash: hashedPassword })
      .eq('id', session.participant.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error: any) {
    console.error('Error in change-password:', error);
    return NextResponse.json({ error: 'Hubo un error al actualizar la contraseña' }, { status: 500 });
  }
}
