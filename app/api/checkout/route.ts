import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPaymentPendingEmail, sendAdminReceiptEmail } from '@/lib/email';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust size limit as needed (e.g., 10mb for large screenshots)
    },
  },
};

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Checkout attempt started`);

  try {
    const body = await request.json();
    const { raffleId, quantity, fullName, phone, email, cedula, paymentMethod, price, raffleTitle, receiptImage } = body;

    // 0. Basic Validation
    if (!raffleId || !quantity || quantity < 1 || !fullName || !phone || !email || !paymentMethod) {
      console.warn(`[${requestId}] Missing required fields`);
      return NextResponse.json({ error: 'Faltan campos obligatorios para procesar la compra.' }, { status: 400 });
    }

    // 1. Get Raffle info
    const { data: raffle, error: raffleError } = await supabaseAdmin
      .from('raffles')
      .select('total_tickets, is_active')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffle) {
      console.error(`[${requestId}] Raffle not found:`, raffleError);
      return NextResponse.json({ error: 'La rifa no existe o no está disponible.' }, { status: 404 });
    }

    if (!raffle.is_active) {
      return NextResponse.json({ error: 'Esta rifa se encuentra pausada actualmente.' }, { status: 400 });
    }

    // 2. Concurrency-safe Ticket Picking
    // Instead of fetching all and choosing, we'll use a smarter approach
    // We fetch occupied tickets to know the count
    const { count: occupiedCount, error: countError } = await supabaseAdmin
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('raffle_id', raffleId);

    if (countError) throw countError;

    if ((occupiedCount || 0) + quantity > raffle.total_tickets) {
      return NextResponse.json({ error: 'No hay suficientes boletos disponibles.' }, { status: 400 });
    }

    // 3. Find or Create Participant
    let participantId;
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    const { data: existingParticipant, error: searchError } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingParticipant) {
      participantId = existingParticipant.id;
      await supabaseAdmin
        .from('participants')
        .update({ full_name: fullName, email: email.toLowerCase().trim(), cedula: cedula })
        .eq('id', participantId);
    } else {
      const { data: newParticipant, error: pError } = await supabaseAdmin
        .from('participants')
        .insert([{ full_name: fullName, phone: cleanPhone, email: email.toLowerCase().trim(), cedula: cedula }])
        .select('id')
        .single();

      if (pError) throw pError;
      participantId = newParticipant.id;
    }

    // 4. Assign Tickets with Retry Logic (Deterministic check + random pick)
    // We still fetch occupied for small numbers to pick quickly
    const { data: occupiedTickets } = await supabaseAdmin
      .from('tickets')
      .select('ticket_number')
      .eq('raffle_id', raffleId);
    
    const occupiedSet = new Set(occupiedTickets?.map(t => t.ticket_number) || []);
    const availablePool: string[] = [];
    for (let i = 0; i < raffle.total_tickets; i++) {
        const numStr = i.toString().padStart(4, '0');
        if (!occupiedSet.has(numStr)) availablePool.push(numStr);
    }

    // Shuffle and pick
    const assignedTickets: string[] = [];
    for (let i = 0; i < quantity; i++) {
        if (availablePool.length === 0) break;
        const idx = Math.floor(Math.random() * availablePool.length);
        assignedTickets.push(availablePool.splice(idx, 1)[0]);
    }

    if (assignedTickets.length < quantity) {
        return NextResponse.json({ error: 'Error al asignar números. Intente de nuevo.' }, { status: 500 });
    }

    // Generate secure Verification Code (3 letters + 1 digit)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    code += digits.charAt(Math.floor(Math.random() * digits.length));
    const verificationCode = code;

    // 5. Insert Tickets
    const ticketsData = assignedTickets.map(num => ({
      raffle_id: raffleId,
      participant_id: participantId,
      ticket_number: num,
      status: 'pending',
      payment_method: paymentMethod,
      verification_code: verificationCode
    }));

    const { error: tError } = await supabaseAdmin
      .from('tickets')
      .insert(ticketsData);

    if (tError) {
      console.error(`[${requestId}] Insert tickets error:`, tError);
      if (tError.code === '23505') {
        return NextResponse.json(
          { error: 'Los números se acaban de ocupar. Por favor, intenta de nuevo.' },
          { status: 409 }
        );
      }
      throw tError;
    }

    // 6. Send Emails (Non-blocking usually, but we await to ensure delivery info)
    const totalPrice = Number(price) * assignedTickets.length;
    const ticketNumbersFormatted = assignedTickets.join(', ');

    if (process.env.EMAIL_SERVER_USER) {
      try {
        await Promise.all([
            sendPaymentPendingEmail(email, ticketNumbersFormatted, raffleTitle, paymentMethod, totalPrice, verificationCode),
            receiptImage ? sendAdminReceiptEmail(fullName, phone, email, cedula, ticketNumbersFormatted, raffleTitle, paymentMethod, totalPrice, receiptImage, verificationCode) : Promise.resolve()
        ]);
      } catch (e) {
        console.error(`[${requestId}] Email sending failed:`, e);
      }
    }

    console.log(`[${requestId}] Purchase successful: ${assignedTickets.join(', ')}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Compra completada exitosamente',
      assignedTickets: assignedTickets,
      verificationCode: verificationCode
    });

  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Hubo un error inesperado. Por favor contacta soporte.' },
      { status: 500 }
    );
  }
}
