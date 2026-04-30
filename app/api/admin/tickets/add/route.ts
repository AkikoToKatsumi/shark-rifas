import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminSession, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { verificationCode, raffleId } = body;

    if (!verificationCode || !raffleId) {
      return NextResponse.json({ error: 'Código y Raffle ID requeridos' }, { status: 400 });
    }

    // 1. Find the first ticket of this group to get participant_id and current status
    const { data: firstTicket, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('participant_id, status, raffle_id')
      .eq('verification_code', verificationCode)
      .limit(1)
      .single();

    if (fetchError || !firstTicket) {
      return NextResponse.json({ error: 'No se encontró la compra original.' }, { status: 404 });
    }

    // 2. Determine raffle parameters (total tickets)
    const { data: raffle } = await supabaseAdmin
      .from('raffles')
      .select('total_tickets')
      .eq('id', raffleId)
      .single();
    
    if (!raffle) {
      return NextResponse.json({ error: 'Rifa no encontrada.' }, { status: 404 });
    }

    // 3. Find an available ticket number for this raffle
    const { data: occupiedTickets } = await supabaseAdmin
      .from('tickets')
      .select('ticket_number')
      .eq('raffle_id', raffleId);
    
    const occupiedSet = new Set(occupiedTickets?.map(t => t.ticket_number) || []);
    let assignedNumber = null;

    // Search for any free number (Randomized for variety)
    const maxTickets = Number(raffle.total_tickets);
    // Start with a random offset to avoid always filling from 0000
    const offset = Math.floor(Math.random() * maxTickets);
    
    for (let i = 0; i < maxTickets; i++) {
        const checkIdx = (offset + i) % maxTickets;
        const numStr = checkIdx.toString().padStart(4, '0');
        if (!occupiedSet.has(numStr)) {
            assignedNumber = numStr;
            break;
        }
    }

    if (!assignedNumber) {
        return NextResponse.json({ error: 'No hay boletos disponibles para esta rifa.' }, { status: 400 });
    }

    // 4. Insert the new ticket inheriting existing data
    const { error: insertError } = await supabaseAdmin
      .from('tickets')
      .insert([{
        raffle_id: raffleId,
        participant_id: firstTicket.participant_id,
        ticket_number: assignedNumber,
        status: firstTicket.status, // Inherit status (if paid, remains paid)
        payment_method: 'manual_admin',
        verification_code: verificationCode
      }]);

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      message: 'Boleto agregado exitosamente.',
      ticketNumber: assignedNumber 
    });
    
  } catch (error: any) {
    console.error('Add Ticket Error:', error);
    return NextResponse.json({ error: 'Error al agregar boleto' }, { status: 500 });
  }
}
