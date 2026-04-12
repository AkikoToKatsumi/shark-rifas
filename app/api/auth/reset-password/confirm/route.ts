import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { loginId, pin, newPassword } = await request.json();

    if (!loginId || !pin || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const cleanLoginId = loginId.toLowerCase().trim().replace(/[-\s]+/g, '');

    // Get user and verify PIN
    const { data: participant, error: fetchError } = await supabaseAdmin
      .from('participants')
      .select('id, reset_password_pin, reset_password_expiry')
      .or(`cedula.eq.${cleanLoginId},phone.eq.${cleanLoginId},email.eq.${cleanLoginId}`)
      .not('password_hash', 'is', null)
      .single();

    if (fetchError || !participant) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (participant.reset_password_pin !== pin) {
      return NextResponse.json({ error: 'El código ingresado es incorrecta' }, { status: 400 });
    }

    const expiryDate = new Date(participant.reset_password_expiry);
    if (expiryDate < new Date()) {
      return NextResponse.json({ error: 'El código ha expirado' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear PIN
    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({ 
        password_hash: hashedPassword,
        reset_password_pin: null, 
        reset_password_expiry: null 
      })
      .eq('id', participant.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Contraseña restablecida exitosamente' });
  } catch (error: any) {
    console.error('Error in reset-password-confirm:', error);
    return NextResponse.json({ error: 'Hubo un error al procesar la solicitud' }, { status: 500 });
  }
}
