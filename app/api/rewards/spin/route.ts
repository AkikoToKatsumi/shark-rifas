import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

// Weighted options for normal spins
const WEIGHTED_OPTIONS = [
  { value: 0, weight: 20 },
  { value: 10, weight: 40 },
  { value: 20, weight: 25 },
  { value: 50, weight: 10 },
  { value: 100, weight: 4 },
  { value: 200, weight: 1 },
];

function getRandomWeightedOption() {
  const totalWeight = WEIGHTED_OPTIONS.reduce((acc, opt) => acc + opt.weight, 0);
  let random = Math.random() * totalWeight;
  for (const option of WEIGHTED_OPTIONS) {
    if (random < option.weight) return option.value;
    random -= option.weight;
  }
  return 0;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para usar la ruleta' }, { status: 401 });
    }

    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('id, points, last_spin_date, total_spins, last_spin_count')
      .eq('id', session.participant.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = participant.last_spin_date !== today;
    
    let currentSpinCount = isNewDay ? 0 : (participant.last_spin_count || 0);

    // Logic for multiple spins
    if (currentSpinCount >= 2) {
      return NextResponse.json({ error: 'Ya has agotado tus giros por hoy. Vuelve mañana.' }, { status: 403 });
    }

    if (currentSpinCount === 1) {
      // Check if user has bought a ticket today and it's paid
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const { count, error: ticketError } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('participant_id', participant.id)
        .eq('status', 'paid')
        .gte('created_at', startOfToday.toISOString());

      if (ticketError) throw ticketError;

      if (!count || count === 0) {
        return NextResponse.json({ 
          error: 'NEED_PURCHASE', 
          message: '¡Te queda un chance! Prueba tu suerte comprando un boleto en cualquier rifa activa para girar otra vez hoy.' 
        }, { status: 403 });
      }
    }

    // Determine points won
    let pointsWon = 0;
    if ((participant.total_spins || 0) === 0) {
      // First time bonus!
      pointsWon = 100;
    } else {
      pointsWon = getRandomWeightedOption();
    }

    const newPoints = (participant.points || 0) + pointsWon;
    const newTotalSpins = (participant.total_spins || 0) + 1;
    const newSpinCount = currentSpinCount + 1;

    // Update DB
    const { error } = await supabaseAdmin
      .from('participants')
      .update({
        points: newPoints,
        last_spin_date: today,
        last_spin_count: newSpinCount,
        total_spins: newTotalSpins
      })
      .eq('id', participant.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      pointsWon, 
      newTotalPoints: newPoints,
      spinsToday: newSpinCount
    });

  } catch (error: any) {
    console.error('Spin error:', error);
    return NextResponse.json({ error: 'Hubo un error al girar la ruleta' }, { status: 500 });
  }
}
