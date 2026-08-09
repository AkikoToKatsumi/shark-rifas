import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPaymentPendingEmail, sendAdminReceiptEmail } from '@/lib/email';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Checkout attempt started`);

  try {
    const body = await request.json();
    const { raffleId, quantity, fullName, phone, email, cedula, paymentMethod, price, raffleTitle, receiptImage, collectorId } = body;

    const POINTS_PER_TICKET = 500;
    const requiredPoints = quantity * POINTS_PER_TICKET;
    let session = null;

    if (paymentMethod === 'points') {
      session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Debes iniciar sesión para usar puntos.' }, { status: 401 });
      }
    }

    // 0. Basic Validation
    if (!raffleId || !quantity || quantity < 1 || !fullName || !phone || !paymentMethod) {
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
    const cleanCedula = cedula ? cedula.trim().replace(/[-\s]+/g, '') : null;

    // Search by Cedula first (Primary ID), then by Phone (Backup)
    let { data: existingParticipant } = cleanCedula 
      ? await supabaseAdmin.from('participants').select('id').eq('cedula', cleanCedula).maybeSingle()
      : { data: null };

    if (!existingParticipant) {
      const { data: phoneMatch } = await supabaseAdmin
        .from('participants')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();
      existingParticipant = phoneMatch;
    }

    if (existingParticipant) {
      participantId = existingParticipant.id;

      // Assign customer_code if participant is missing one
      let existingCode = (existingParticipant as any).customer_code;
      if (!existingCode) {
        let nextCode = '001';
        const { data: maxP } = await supabaseAdmin
          .from('participants')
          .select('customer_code')
          .not('customer_code', 'is', null)
          .order('customer_code', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (maxP?.customer_code) {
          const parsed = parseInt(maxP.customer_code, 10);
          if (!isNaN(parsed)) nextCode = (parsed + 1).toString().padStart(3, '0');
        }
        existingCode = nextCode;
      }

      await supabaseAdmin
        .from('participants')
        .update({ 
          full_name: fullName, 
          email: email ? email.toLowerCase().trim() : `no-email-${cleanPhone}@sharkrifas.com`, 
          cedula: cleanCedula || cedula,
          phone: cleanPhone,
          customer_code: existingCode
        })
        .eq('id', participantId);
    } else {
      // 3.1 Generate Customer Code (sequential)
      let customerCode = '001';
      const { data: lastParticipant, error: lastError } = await supabaseAdmin
        .from('participants')
        .select('customer_code')
        .not('customer_code', 'is', null)
        .order('customer_code', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (lastParticipant && lastParticipant.customer_code) {
        const lastNum = parseInt(lastParticipant.customer_code, 10);
        customerCode = (lastNum + 1).toString().padStart(3, '0');
      }

      const { data: newParticipant, error: pError } = await supabaseAdmin
        .from('participants')
        .insert([{ 
          full_name: fullName, 
          phone: cleanPhone, 
          email: email ? email.toLowerCase().trim() : `no-email-${cleanPhone}@sharkrifas.com`, 
          cedula: cleanCedula || cedula,
          customer_code: customerCode
        }])
        .select('id')
        .single();

      if (pError) throw pError;
      participantId = newParticipant.id;
      existingParticipant = newParticipant;
    }

    if (paymentMethod === 'points') {
      if (session && session.participant.id !== participantId && session.participant.phone !== cleanPhone) {
        return NextResponse.json({ error: 'El usuario de la sesión no coincide.' }, { status: 403 });
      }
      
      const { data: pData } = await supabaseAdmin.from('participants').select('points').eq('id', participantId).single();
      const userPoints = pData?.points || 0;
      
      if (userPoints < requiredPoints) {
        return NextResponse.json({ error: `Puntos insuficientes. Necesitas ${requiredPoints} puntos.` }, { status: 400 });
      }
      
      // Deduct points
      const { error: deductError } = await supabaseAdmin
        .from('participants')
        .update({ points: userPoints - requiredPoints })
        .eq('id', participantId);
        
      if (deductError) {
        return NextResponse.json({ error: 'Error al deducir los puntos.' }, { status: 500 });
      }
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
    // Solo los puntos y las ventas de colaboradores son automáticos. 
    // Las ventas de colaboradores (payment_method: 'cash') se marcan como 'paid' inmediatamente.
    const isPaid = paymentMethod === 'points' || paymentMethod === 'cash';
    const ticketsData = assignedTickets.map(num => ({
      raffle_id: raffleId,
      participant_id: participantId,
      ticket_number: num,
      status: isPaid ? 'paid' : 'pending',
      payment_method: paymentMethod,
      verification_code: verificationCode,
      collector_id: collectorId || null
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
        if (paymentMethod === 'points') {
          // Send confirmed email immediately for points purchases
          const { sendPaymentConfirmedEmail } = await import('@/lib/email');
          if (email) {
            await sendPaymentConfirmedEmail(email, ticketNumbersFormatted, raffleTitle, 'CANJE DE PUNTOS', totalPrice, verificationCode);
          }
        } else {
          // Standard pending email for bank transfers
          const isDummyEmail = email && email.startsWith('no-email-');
          const shouldSendAdminEmail = receiptImage || paymentMethod === 'cash';
          
          await Promise.all([
              (email && !isDummyEmail) ? sendPaymentPendingEmail(email, ticketNumbersFormatted, raffleTitle, paymentMethod, totalPrice, verificationCode) : Promise.resolve(),
              shouldSendAdminEmail ? sendAdminReceiptEmail(fullName, phone, isDummyEmail ? 'No proporcionado' : email, cedula, ticketNumbersFormatted, raffleTitle, paymentMethod, totalPrice, receiptImage, verificationCode) : Promise.resolve()
          ]);
        }
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
    console.error(`[${requestId}] Checkout Unexpected error:`, error);
    
    // Log more details if it's a Supabase error
    if (error.code) console.error(`[${requestId}] DB Error Code: ${error.code}, Message: ${error.message}`);
    if (error.details) console.error(`[${requestId}] DB Error Details: ${error.details}`);
    if (error.hint) console.error(`[${requestId}] DB Error Hint: ${error.hint}`);

    return NextResponse.json(
      { error: error.message || 'Hubo un error inesperado. Por favor contacta soporte.' },
      { status: 500 }
    );
  }
}
