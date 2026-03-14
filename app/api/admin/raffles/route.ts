import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const validateAdminKey = (request: Request) => {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === process.env.ADMIN_SECRET_KEY;
};

// GET all raffles (including inactive ones)
export async function GET(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { data: raffles, error } = await supabaseAdmin
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, raffles });
  } catch (error: any) {
    console.error('Admin API GET Raffles Error:', error);
    return NextResponse.json({ error: 'Error obteniendo rifas' }, { status: 500 });
  }
}

// POST create a new raffle
export async function POST(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, emoji, ticket_price, total_tickets, draw_date } = body;

    if (!title || !ticket_price || !total_tickets) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('raffles')
      .insert([
        { 
          title, 
          description, 
          emoji: emoji || '🎟️', 
          ticket_price, 
          total_tickets, 
          draw_date,
          is_active: true 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, raffle: data });
  } catch (error: any) {
    console.error('Admin API POST Raffles Error:', error);
    return NextResponse.json({ error: 'Error creando rifa' }, { status: 500 });
  }
}

// PATCH update a raffle (e.g. deactivate)
export async function PATCH(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('raffles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, raffle: data });
  } catch (error: any) {
    console.error('Admin API PATCH Raffles Error:', error);
    return NextResponse.json({ error: 'Error actualizando rifa' }, { status: 500 });
  }
}

// DELETE a raffle
export async function DELETE(request: Request) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID de la rifa a eliminar' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('raffles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin API DELETE Raffles Error:', error);
    return NextResponse.json({ error: 'Error eliminando rifa' }, { status: 500 });
  }
}
