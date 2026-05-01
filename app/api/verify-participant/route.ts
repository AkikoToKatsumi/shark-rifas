import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminSession, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    if (!await validateAdminSession()) {
      return unauthorizedResponse();
    }
    const body = await request.json();
    let { query } = body; 
    
    if (!query) {
      return NextResponse.json({ error: 'Ingresa un teléfono o cédula.' }, { status: 400 });
    }

    const cleanQuery = query.trim().replace(/[-\s]+/g, '');
    const isTicketNumber = /^\d{1,4}$/.test(cleanQuery);

    // Search for the participant by exact phone or cedula
    let { data: participants, error: pError } = await supabaseAdmin
      .from('participants')
      .select('id, full_name, phone, cedula')
      .or(`phone.eq.${cleanQuery},cedula.eq.${cleanQuery}`)
      .limit(1);

    let participant;

    if (!participants || participants.length === 0) {
      // If not found by phone/cedula, try by verification_code or ticket number
      const { data: ticketMatches } = await supabaseAdmin
        .from('tickets')
        .select('verification_code, ticket_number, participants!participant_id!inner(id, full_name, phone, cedula)')
        .or(`verification_code.eq.${cleanQuery}${isTicketNumber ? `,ticket_number.eq.${cleanQuery.padStart(4, '0')}` : ''}`)
        .limit(1);
      
      if (ticketMatches && ticketMatches.length > 0) {
        const firstMatch = ticketMatches[0];
        const p = firstMatch.participants;
        participant = Array.isArray(p) ? p[0] : p;
        
        // If it was a verification code match, we should probably show all tickets of that code
        if (firstMatch.verification_code === cleanQuery) {
          // We'll use this info later to filter
        }
      }
    } else {
      participant = participants[0];
    }

    if (!participant) {
      return NextResponse.json({ error: 'No se encontraron registros para este número.' }, { status: 404 });
    }

    // Fetch tickets for this participant
    let ticketQuery = supabaseAdmin
      .from('tickets')
      .select(`
        ticket_number,
        status,
        created_at,
        verification_code,
        raffles (
          id,
          title,
          image_url
        )
      `)
      .eq('participant_id', participant.id);

    // If searching by ticket number or verification code (NOT by phone/cedula), 
    // filter to show only those matching the search
    const wasFoundByPhoneOrCedula = participants && participants.length > 0;
    if (!wasFoundByPhoneOrCedula) {
      if (isTicketNumber) {
        ticketQuery = ticketQuery.or(`ticket_number.eq.${cleanQuery.padStart(4, '0')},verification_code.eq.${cleanQuery}`);
      } else {
        ticketQuery = ticketQuery.eq('verification_code', cleanQuery);
      }
    }

    const { data: tickets, error: tError } = await ticketQuery.order('created_at', { ascending: false });

    if (tError || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'El participante no tiene boletos registrados con ese número.' }, { status: 404 });
    }

    // Since a participant could have tickets in multiple raffles, we'll group them
    const groupedByRaffle: Record<string, any> = {};

    tickets.forEach(t => {
      const raffleData: any = Array.isArray(t.raffles) ? t.raffles[0] : t.raffles;
      const rId = raffleData?.id || 'general';
      if (!groupedByRaffle[rId]) {
        groupedByRaffle[rId] = {
          raffleId: rId,
          raffleTitle: raffleData?.title || 'Rifa General',
          raffleImage: raffleData?.image_url || '',
          latestDate: t.created_at,
          allPaid: true,
          totalTickets: 0,
          numbers: []
        };
      }
      
      groupedByRaffle[rId].numbers.push(t.ticket_number);
      groupedByRaffle[rId].totalTickets++;
      if (t.status !== 'paid') {
        groupedByRaffle[rId].allPaid = false;
      }

      // Update latest date if this ticket is newer
      if (new Date(t.created_at) > new Date(groupedByRaffle[rId].latestDate)) {
        groupedByRaffle[rId].latestDate = t.created_at;
      }
    });

    const results = Object.values(groupedByRaffle).map(r => ({
      ...r,
      numbers: r.numbers.sort((a: string, b: string) => parseInt(a) - parseInt(b))
    }));

    // Ofuscar nombre: "Juan Perez" -> "Ju** Pe***"
    const rawName = participant.full_name || 'Participante';
    const participantName = rawName.split(' ').map((n: string) => n.length > 2 ? n.substring(0, 2) + '*'.repeat(n.length - 2) : n).join(' ');

    return NextResponse.json({ 
      success: true, 
      participantName,
      raffles: results 
    });

  } catch (error: any) {
    console.error('Verify Participant API Error:', error);
    return NextResponse.json(
      { error: 'Error al verificar los datos.' },
      { status: 500 }
    );
  }
}
