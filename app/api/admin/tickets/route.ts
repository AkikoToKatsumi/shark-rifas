import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPaymentConfirmedEmail } from '@/lib/email';

// Helper to validate admin key
const validateAdminKey = (request: Request) => {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === process.env.ADMIN_SECRET_KEY;
};

// GET: Fetch all tickets with participant details
export async function GET(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const raffleId = searchParams.get('raffleId');

    let query = supabaseAdmin
      .from('tickets')
      .select(`
        id,
        raffle_id,
        ticket_number,
        status,
        payment_method,
        created_at,
        participants (
          id,
          full_name,
          phone,
          email
        )
      `)
      .order('ticket_number', { ascending: true });

    if (raffleId) {
      query = query.eq('raffle_id', raffleId);
    }

    const { data: tickets, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error('Admin API GET Error:', error);
    return NextResponse.json({ error: 'Error obteniendo tickets' }, { status: 500 });
  }
}

// PATCH: Update ticket status (e.g. confirm payment)
export async function PATCH(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ticketIds, status } = body;

    if (!ticketIds || !Array.isArray(ticketIds) || !status) {
      return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 });
    }

    // If marking as paid, fetch ticket details beforehand to send emails
    let ticketsToEmail: any[] = [];
    if (status === 'paid' && process.env.EMAIL_SERVER_USER) {
      const { data: fetchedTickets, error: fetchError } = await supabaseAdmin
        .from('tickets')
        .select(`
          ticket_number,
          payment_method,
          verification_code,
          participants ( email ),
          raffles ( title, ticket_price )
        `)
        .in('id', ticketIds);
        
      if (!fetchError && fetchedTickets) {
        ticketsToEmail = fetchedTickets;
      }
    }

    const { error } = await supabaseAdmin
      .from('tickets')
      .update({ status })
      .in('id', ticketIds);

    if (error) throw error;

    // Send asynchronous confirmation emails
    if (ticketsToEmail.length > 0) {
      ticketsToEmail.forEach(ticket => {
        // Suppress TS warnings safely by casting or optional chaining; Supabase joins return arrays or objects
        const participant = Array.isArray(ticket.participants) ? ticket.participants[0] : ticket.participants;
        const raffle = Array.isArray(ticket.raffles) ? ticket.raffles[0] : ticket.raffles;
        
        if (participant?.email && raffle?.title) {
          sendPaymentConfirmedEmail(
            participant.email,
            ticket.ticket_number,
            raffle.title,
            ticket.payment_method || 'transferencia',
            raffle.ticket_price || 0,
            ticket.verification_code
          );
        }
      });
    }

    return NextResponse.json({ success: true, message: `Tickets actualizados a ${status}` });
  } catch (error: any) {
    console.error('Admin API PATCH Error:', error);
    return NextResponse.json({ error: 'Error actualizando tickets' }, { status: 500 });
  }
}

// DELETE: Cancel ticket reservation (free up the number)
export async function DELETE(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ticketIds } = body;

    if (!ticketIds || !Array.isArray(ticketIds)) {
      return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tickets')
      .delete()
      .in('id', ticketIds);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Reservas eliminadas.' });
  } catch (error: any) {
    console.error('Admin API DELETE Error:', error);
    return NextResponse.json({ error: 'Error eliminando tickets' }, { status: 500 });
  }
}
