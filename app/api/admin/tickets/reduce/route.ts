import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminSession, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { verificationCode } = body;

    if (!verificationCode) {
      return NextResponse.json({ error: 'Código de verificación requerido' }, { status: 400 });
    }

    // Find the latest ticket for this verification code
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('id')
      .eq('verification_code', verificationCode)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'No se encontraron boletos para este código.' }, { status: 404 });
    }

    // Delete the ticket
    const { error: deleteError } = await supabaseAdmin
      .from('tickets')
      .delete()
      .eq('id', ticket.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'Boleto eliminado exitosamente.' });
  } catch (error: any) {
    console.error('Reduce Tickets Error:', error);
    return NextResponse.json({ error: 'Error al reducir boletos' }, { status: 500 });
  }
}
