import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

// Define the roulette options and their probabilities (optional, currently uniform)
const ROULETTE_OPTIONS = [0, 10, 20, 50, 100, 200];

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para usar la ruleta' }, { status: 401 });
    }

    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('points, last_spin_date')
      .eq('id', session.participant.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Check cooldown
    const today = new Date().toISOString().split('T')[0];
    if (participant.last_spin_date === today) {
      return NextResponse.json({ error: 'Ya has girado la ruleta hoy. Vuelve mañana.' }, { status: 403 });
    }

    // Spin logic
    const randomIndex = Math.floor(Math.random() * ROULETTE_OPTIONS.length);
    const pointsWon = ROULETTE_OPTIONS[randomIndex];
    const newPoints = (participant.points || 0) + pointsWon;

    // Update DB
    const { error } = await supabaseAdmin
      .from('participants')
      .update({
        points: newPoints,
        last_spin_date: today
      })
      .eq('id', session.participant.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      pointsWon, 
      newTotalHours: newPoints 
    });

  } catch (error: any) {
    console.error('Spin error:', error);
    return NextResponse.json({ error: 'Hubo un error al girar la ruleta' }, { status: 500 });
  }
}
