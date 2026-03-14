import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { query } = body; 
    
    if (!query) {
      return NextResponse.json({ error: 'Ingresa un código de verificación.' }, { status: 400 });
    }

    const cleanQuery = query.trim().toUpperCase();

    // 1. Find tickets associated with this secure verification code
    const { data: tickets, error: tError } = await supabaseAdmin
      .from('tickets')
      .select(`
        ticket_number,
        status,
        payment_method,
        participants (
          id,
          full_name
        ),
        raffles (
          title
        )
      `)
      .eq('verification_code', cleanQuery)
      .order('ticket_number', { ascending: true });

    if (tError || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'Código inválido o no encontrado.' }, { status: 404 });
    }

    // 2. Extract participant name (they will all have the same participant)
    const pData: any = tickets[0].participants;
    const participantName = Array.isArray(pData) ? pData[0]?.full_name : pData?.full_name;

    return NextResponse.json({ 
      success: true, 
      participantName: participantName,
      tickets 
    });

  } catch (error: any) {
    console.error('Verify API Error:', error);
    return NextResponse.json(
      { error: 'Error al verificar los boletos.' },
      { status: 500 }
    );
  }
}
