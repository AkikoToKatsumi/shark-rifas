import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/session';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { fullName, phone, email, cedula, password } = await request.json();

    if (!fullName || !phone || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanCedula = cedula ? cedula.trim().replace(/[-\s]+/g, '') : null;
    const cleanEmail = email.toLowerCase().trim();

    // Check if participant already exists by email or phone
    const { data: existingParticipant } = await supabaseAdmin
      .from('participants')
      .select('id, password_hash')
      .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const passwordHash = await bcrypt.hash(password, 10);

    let participantId;
    let participant;

    if (existingParticipant) {
      if (existingParticipant.password_hash) {
        return NextResponse.json({ error: 'Ya existe una cuenta con este correo o teléfono.' }, { status: 409 });
      }
      
      // Update existing guest "participant" to a registered account
      const { data: updated, error } = await supabaseAdmin
        .from('participants')
        .update({ 
          full_name: fullName, 
          email: cleanEmail,
          cedula: cleanCedula,
          phone: cleanPhone,
          password_hash: passwordHash
        })
        .eq('id', existingParticipant.id)
        .select()
        .single();
        
      if (error) throw error;
      participant = updated;
      participantId = updated.id;
    } else {
      // Generate normal customer code
      let customerCode = '001';
      const { data: lastParticipant } = await supabaseAdmin
        .from('participants')
        .select('customer_code')
        .not('customer_code', 'is', null)
        .order('customer_code', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (lastParticipant && lastParticipant.customer_code) {
        const lastNum = parseInt(lastParticipant.customer_code, 10);
        customerCode = (lastNum + 1).toString().padStart(3, '0');
      }

      const { data: newParticipant, error } = await supabaseAdmin
        .from('participants')
        .insert([{ 
          full_name: fullName, 
          phone: cleanPhone, 
          email: cleanEmail, 
          cedula: cleanCedula,
          customer_code: customerCode,
          password_hash: passwordHash,
          points: 0
        }])
        .select()
        .single();
        
      if (error) throw error;
      participant = newParticipant;
      participantId = newParticipant.id;
    }

    await setSession({
      id: participant.id,
      email: participant.email,
      full_name: participant.full_name,
      phone: participant.phone,
      points: participant.points || 0
    });

    // Send Welcome Email
    if (participant.email) {
      await sendWelcomeEmail(participant.email, participant.full_name, participant.points || 0);
    }

    return NextResponse.json({ success: true, message: 'Registro exitoso' });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Hubo un error al registrarse' }, { status: 500 });
  }
}
