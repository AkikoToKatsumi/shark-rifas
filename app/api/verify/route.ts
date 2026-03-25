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

    let tickets;

    // 1. Try by Verification Code
    const { data: ticketsByCode, error: tError } = await supabaseAdmin
      .from('tickets')
      .select(`
        ticket_number,
        status,
        payment_method,
        participants!inner (
          id,
          full_name,
          phone,
          email
        ),
        raffles (
          title
        )
      `)
      .eq('verification_code', cleanQuery)
      .order('ticket_number', { ascending: true });

    if (ticketsByCode && ticketsByCode.length > 0) {
      tickets = ticketsByCode;
    } else {
      // 2. Try by Phone
      const { data: ticketsByPhone } = await supabaseAdmin
        .from('tickets')
        .select(`
          ticket_number,
          status,
          payment_method,
          participants!inner (
            id,
            full_name,
            phone,
            email
          ),
          raffles (
            title
          )
        `)
        .eq('participants.phone', cleanQuery)
        .order('ticket_number', { ascending: true });
        
      if (ticketsByPhone && ticketsByPhone.length > 0) {
        tickets = ticketsByPhone;
      }
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'Código o número de teléfono no encontrado.' }, { status: 404 });
    }

    // 2. Extract participant name and email (they will all have the same participant in this group)
    const pData: any = tickets[0].participants;
    const participantName = Array.isArray(pData) ? pData[0]?.full_name : pData?.full_name;
    const participantEmail = Array.isArray(pData) ? pData[0]?.email : pData?.email;

    return NextResponse.json({ 
      success: true, 
      participantName: participantName,
      participantEmail: participantEmail,
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
