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
      .select('points, last_spin_date')
      .eq('id', session.participant.id)
      .single();
      
    if (participant) {
      session.participant.points = participant.points || 0;
      (session.participant as any).last_spin_date = participant.last_spin_date;
    }
  } catch(e) {
    console.error('Failed to refresh user points', e);
  }

  return NextResponse.json({ user: session.participant });
}
