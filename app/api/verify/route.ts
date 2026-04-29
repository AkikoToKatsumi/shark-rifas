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
        participants!participant_id (
          full_name,
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
          participants!participant_id (
            full_name,
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

    // 2. Preparar respuesta segura (limpiando datos privados)
    const pData: any = tickets[0].participants;
    const rawName = Array.isArray(pData) ? pData[0]?.full_name : pData?.full_name;
    const rawEmail = Array.isArray(pData) ? pData[0]?.email : pData?.email;

    // Ofuscar nombre: "Juan Perez" -> "Ju** Pe***"
    const participantName = rawName ? rawName.split(' ').map((n: string) => n.length > 2 ? n.substring(0, 2) + '*'.repeat(n.length - 2) : n).join(' ') : 'Participante';
    
    // Ofuscar el email si existe
    const participantEmail = rawEmail ? rawEmail.replace(/(.{2})(.*)(?=@)/, (gp1:any, gp2:any, gp3:any) => gp2 + "*".repeat(gp3.length)) : null;

    return NextResponse.json({ 
      success: true, 
      participantName,
      participantEmail,
      tickets: tickets.map(t => ({
        ticket_number: t.ticket_number,
        status: t.status,
        raffle_title: t.raffles?.title || (Array.isArray(t.raffles) ? t.raffles[0]?.title : 'Rifa')
      }))
    });

  } catch (error: any) {
    console.error('Verify API Error:', error);
    return NextResponse.json(
      { error: 'Error al verificar los boletos.' },
      { status: 500 }
    );
  }
}
