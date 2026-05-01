import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { query } = body; 
    
    if (!query) {
      return NextResponse.json({ error: 'Ingresa un código, teléfono o número de boleto.' }, { status: 400 });
    }

    const cleanQuery = query.trim().toUpperCase();
    const isTicketNumber = /^\d{1,4}$/.test(cleanQuery);

    let tickets: any[] = [];

    // 1. Try by Verification Code (Exact match)
    const { data: ticketsByCode } = await supabaseAdmin
      .from('tickets')
      .select(`
        ticket_number,
        status,
        participants!participant_id!inner (
          full_name,
          email,
          phone,
          cedula
        ),
        raffles (
          title
        )
      `)
      .eq('verification_code', cleanQuery);

    if (ticketsByCode && ticketsByCode.length > 0) {
      tickets = ticketsByCode;
    } else {
      // 2. Try by Phone or Cedula (Fetch ALL tickets of that participant)
      const { data: participantTickets } = await supabaseAdmin
        .from('tickets')
        .select(`
          ticket_number,
          status,
          participants!participant_id!inner (
            full_name,
            email,
            phone,
            cedula
          ),
          raffles (
            title
          )
        `)
        .or(`phone.eq.${cleanQuery},cedula.eq.${cleanQuery}`, { foreignTable: 'participants' })
        .order('ticket_number', { ascending: true });

      if (participantTickets && participantTickets.length > 0) {
        tickets = participantTickets;
      } else if (isTicketNumber) {
        // 3. Try by Ticket Number (Exact match)
        const { data: ticketsByNumber } = await supabaseAdmin
          .from('tickets')
          .select(`
            ticket_number,
            status,
            participants!participant_id!inner (
              full_name,
              email,
              phone,
              cedula
            ),
            raffles (
              title
            )
          `)
          .eq('ticket_number', cleanQuery.padStart(4, '0'))
          .order('created_at', { ascending: false });
        
        if (ticketsByNumber && ticketsByNumber.length > 0) {
          tickets = ticketsByNumber;
        }
      }
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'No se encontraron boletos con ese criterio.' }, { status: 404 });
    }

    // Filter results if searching by specific ticket number to show ONLY that one
    // But ONLY if the search wasn't a phone/cedula search (which usually returns all)
    // Actually, the user says: "deben salir unicamente los boletos comprados ... con ese numero de busqueda"
    if (isTicketNumber) {
      const paddedQuery = cleanQuery.padStart(4, '0');
      tickets = tickets.filter(t => t.ticket_number === paddedQuery);
    }

    const firstTicket = tickets[0];
    const pData: any = firstTicket.participants;
    const participantObj = Array.isArray(pData) ? pData[0] : pData;
    const rawName = participantObj?.full_name;
    const rawEmail = participantObj?.email;

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
        raffle_title: Array.isArray(t.raffles) 
          ? t.raffles[0]?.title 
          : (t.raffles as any)?.title || 'Rifa'
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
