import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { loginId } = await request.json();

    if (!loginId) {
      return NextResponse.json({ error: 'Falta correo electrónico' }, { status: 400 });
    }

    const cleanLoginId = loginId.toLowerCase().trim().replace(/[-\s]+/g, '');

    // The user might request with cedula or phone (or email if we allow it)
    const { data: participant, error: fetchError } = await supabaseAdmin
      .from('participants')
      .select('id, email, full_name, cedula, phone')
      .or(`cedula.eq.${cleanLoginId},phone.eq.${cleanLoginId},email.eq.${cleanLoginId}`)
      .not('password_hash', 'is', null) // Only for registered users
      .single();

    if (fetchError || !participant) {
      // For security, don't confirm if user exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'Si el usuario existe, se enviará un código al correo registrado.' 
      });
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    // Save PIN to DB
    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({ 
        reset_password_pin: pin, 
        reset_password_expiry: expiry.toISOString() 
      })
      .eq('id', participant.id);

    if (updateError) {
      throw updateError;
    }

    // Send email
    await sendPasswordResetEmail(participant.email, participant.full_name, pin);

    return NextResponse.json({ 
      success: true, 
      message: 'Se ha enviado un código de recuperación a tu correo electrónico.',
      email_hint: participant.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Hint for the user
    });
  } catch (error: any) {
    console.error('Error in reset-password-request:', error);
    return NextResponse.json({ error: 'Hubo un error al procesar la solicitud' }, { status: 500 });
  }
}
