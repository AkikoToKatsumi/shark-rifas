import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Fetch only active raffles
    const { data: raffles, error: rError } = await supabaseAdmin
      .from('raffles')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (rError) throw rError;

    // 2. Fetch all tickets to calculate real metrics
    // We fetch only status and raffle_id to minimize data transfer
    const { data: tickets, error: tError } = await supabaseAdmin
      .from('tickets')
      .select('status, raffle_id');

    if (tError) throw tError;

    // 3. Calculate Global Metrics
    const activeRafflesCount = raffles.length;
    
    let totalTicketsPossible = 0;
    raffles.forEach(r => totalTicketsPossible += (r.total_tickets || 0));
    
    // Sold = 'paid' + 'pending' (reserved)
    const soldTicketsCount = tickets.length;
    
    // Sum of prizes: (3rd: 50k + 4th: 25k) + (5 instant * 3k) + (bonus: 10k) = 100k per raffle
    const cashPrizes = 75000;
    const instantPrizes = 15000;
    const bonusPrize = 10000;
    const totalPrizesPerRaffle = cashPrizes + instantPrizes + bonusPrize;
    
    const prizesTotal = raffles.length > 0 ? `RD$${(raffles.length * totalPrizesPerRaffle).toLocaleString()}` : 'RD$0';

    // 4. Attach sold count to each raffle
    const rafflesWithSold = raffles.map(raffle => {
      const soldForThis = tickets.filter(t => t.raffle_id === raffle.id).length;
      return {
        ...raffle,
        sold: soldForThis
      };
    });

    return NextResponse.json({
      success: true,
      raffles: rafflesWithSold,
      metrics: {
        active: activeRafflesCount,
        ticketsSold: soldTicketsCount,
        totalPossible: totalTicketsPossible,
        prizesTotal
      }
    });

  } catch (error: any) {
    console.error('Public API Raffles Error:', error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}
