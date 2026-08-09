import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const cleanLoginId = loginId.toLowerCase().trim().replace(/[-\s]+/g, '');

    // The user might login with phone, email or cedula
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('*')
      .or(`phone.eq.${cleanLoginId},email.eq.${cleanLoginId},cedula.eq.${cleanLoginId}`)
      .not('password_hash', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, participant.password_hash);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    await setSession({
      id: participant.id,
      email: participant.email,
      full_name: participant.full_name,
      phone: participant.phone,
      points: participant.points || 0,
      cedula: participant.cedula,
      total_spins: participant.total_spins || 0,
      last_spin_count: participant.last_spin_count || 0
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Hubo un error al iniciar sesión' }, { status: 500 });
  }
}
