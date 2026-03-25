import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPaymentConfirmedEmail, sendPaymentRejectedEmail } from '@/lib/email';

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
        verification_code,
        created_at,
        participants (
          id,
          full_name,
          phone,
          email,
          cedula,
          customer_code
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

    // If marking as paid, fetch ticket details beforehand to send ONE email per purchase group
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

    // Group tickets by (email + raffle title + verification_code) to send ONE email per group
    if (ticketsToEmail.length > 0) {
      // Map: groupKey -> { email, raffleTitle, paymentMethod, ticketPrice, verificationCode, ticketNumbers[] }
      const groups = new Map<string, {
        email: string;
        raffleTitle: string;
        paymentMethod: string;
        ticketPrice: number;
        verificationCode: string;
        ticketNumbers: string[];
      }>();

      for (const ticket of ticketsToEmail) {
        const participant = Array.isArray(ticket.participants) ? ticket.participants[0] : ticket.participants;
        const raffle = Array.isArray(ticket.raffles) ? ticket.raffles[0] : ticket.raffles;

        if (!participant?.email || !raffle?.title) continue;

        // Group key: same customer + same raffle + same purchase batch (verification_code)
        const groupKey = `${participant.email}|${raffle.title}|${ticket.verification_code || 'none'}`;

        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            email: participant.email,
            raffleTitle: raffle.title,
            paymentMethod: ticket.payment_method || 'transferencia',
            ticketPrice: raffle.ticket_price || 0,
            verificationCode: ticket.verification_code,
            ticketNumbers: [],
          });
        }

        groups.get(groupKey)!.ticketNumbers.push(ticket.ticket_number);
      }

      // Send one email per group (one per purchase batch)
      for (const group of Array.from(groups.values())) {
        const allTicketNumbers = group.ticketNumbers.join(', ');
        const totalPrice = group.ticketPrice * group.ticketNumbers.length;

        sendPaymentConfirmedEmail(
          group.email,
          allTicketNumbers,
          group.raffleTitle,
          group.paymentMethod,
          totalPrice,
          group.verificationCode
        );
      }
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

    // 1. Fetch ticket details before deleting to send cancellation email
    let ticketsToEmail: any[] = [];
    if (process.env.EMAIL_SERVER_USER) {
      const { data: fetchedTickets, error: fetchError } = await supabaseAdmin
        .from('tickets')
        .select(`
          ticket_number,
          verification_code,
          participants ( email ),
          raffles ( title )
        `)
        .in('id', ticketIds);
        
      if (!fetchError && fetchedTickets) {
        ticketsToEmail = fetchedTickets;
      }
    }

    // 2. Delete tickets
    const { error } = await supabaseAdmin
      .from('tickets')
      .delete()
      .in('id', ticketIds);

    if (error) throw error;

    // 3. Group and send cancellation emails
    if (ticketsToEmail.length > 0) {
      const groups = new Map<string, {
        email: string;
        raffleTitle: string;
        verificationCode: string;
        ticketNumbers: string[];
      }>();

      for (const ticket of ticketsToEmail) {
        const participant = Array.isArray(ticket.participants) ? ticket.participants[0] : ticket.participants;
        const raffle = Array.isArray(ticket.raffles) ? ticket.raffles[0] : ticket.raffles;

        if (!participant?.email || !raffle?.title) continue;

        const groupKey = `${participant.email}|${raffle.title}|${ticket.verification_code || 'none'}`;

        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            email: participant.email,
            raffleTitle: raffle.title,
            verificationCode: ticket.verification_code,
            ticketNumbers: [],
          });
        }

        groups.get(groupKey)!.ticketNumbers.push(ticket.ticket_number);
      }

      for (const group of Array.from(groups.values())) {
        const allTicketNumbers = group.ticketNumbers.join(', ');
        sendPaymentRejectedEmail(
          group.email,
          allTicketNumbers,
          group.raffleTitle,
          group.verificationCode
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Reservas eliminadas y correo de cancelación enviado.' });
  } catch (error: any) {
    console.error('Admin API DELETE Error:', error);
    return NextResponse.json({ error: 'Error eliminando tickets' }, { status: 500 });
  }
}
