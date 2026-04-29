import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { query } = body; 
    
    if (!query) {
      return NextResponse.json({ error: 'Ingresa un teléfono o cédula.' }, { status: 400 });
    }

    const cleanQuery = query.trim().replace(/[-\s]+/g, '');

    // Search for the participant by exact phone or cedula
    const { data: participants, error: pError } = await supabaseAdmin
      .from('participants')
      .select('id, full_name, phone, cedula')
      .or(`phone.eq.${cleanQuery},cedula.eq.${cleanQuery}`)
      .limit(1);

    if (pError || !participants || participants.length === 0) {
      return NextResponse.json({ error: 'No se encontraron registros para este número.' }, { status: 404 });
    }

    const participant = participants[0];

    // Fetch all tickets for this participant, grouped by raffle
    const { data: tickets, error: tError } = await supabaseAdmin
      .from('tickets')
      .select(`
        ticket_number,
        status,
        created_at,
        raffles (
          id,
          title,
          image_url
        )
      `)
      .eq('participant_id', participant.id)
      .order('created_at', { ascending: false });

    if (tError || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'El participante no tiene boletos registrados.' }, { status: 404 });
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
