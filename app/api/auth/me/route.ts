import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Refresh points from DB in case they spent them or won some
  try {
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('points, last_spin_date, phone, email, full_name, cedula, total_spins, last_spin_count')
      .eq('id', session.participant.id)
      .single();
      
    if (participant) {
      session.participant.points = participant.points || 0;
      session.participant.cedula = participant.cedula;
      session.participant.phone = participant.phone;
      session.participant.email = participant.email;
      session.participant.full_name = participant.full_name;
      session.participant.total_spins = participant.total_spins || 0;
      session.participant.last_spin_count = participant.last_spin_count || 0;
      (session.participant as any).last_spin_date = participant.last_spin_date;
    }
  } catch(e) {
    console.error('Failed to refresh user points', e);
  }

  return NextResponse.json({ user: session.participant });
}
