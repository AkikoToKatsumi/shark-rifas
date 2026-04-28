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
      .select('points, last_spin_date, phone, email, full_name, cedula, total_spins, last_spin_count, is_cash_collector')
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
      (session.participant as any).is_cash_collector = participant.is_cash_collector || false;

      // Check for tickets today
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      const isoToday = startOfToday.toISOString();

      const { data: ticketsToday } = await supabaseAdmin
        .from('tickets')
        .select('status')
        .eq('participant_id', session.participant.id)
        .gte('created_at', isoToday);

      (session.participant as any).has_paid_ticket_today = ticketsToday?.some(t => t.status === 'paid') || false;
      (session.participant as any).has_pending_ticket_today = ticketsToday?.some(t => t.status === 'reserved' || t.status === 'pending') || false;
    }
  } catch(e) {
    console.error('Failed to refresh user points', e);
  }

  return NextResponse.json({ user: session.participant });
}
