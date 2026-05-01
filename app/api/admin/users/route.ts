import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminSession, unauthorizedResponse } from '@/lib/auth';
import bcrypt from 'bcrypt';

// GET: Fetch all participants (users)
export async function GET(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const { data: users, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Admin API Users GET Error:', error);
    return NextResponse.json({ error: 'Error obteniendo usuarios' }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { full_name, email, phone, cedula, points, is_cash_collector, password } = body;

    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    // Generate a customer code if not provided
    let customer_code = '001';
    const { data: lastParticipant } = await supabaseAdmin
      .from('participants')
      .select('customer_code')
      .not('customer_code', 'is', null)
      .order('customer_code', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (lastParticipant && lastParticipant.customer_code) {
      customer_code = (parseInt(lastParticipant.customer_code, 10) + 1).toString().padStart(3, '0');
    }

    const { data, error } = await supabaseAdmin
      .from('participants')
      .insert([{
        full_name,
        email: email?.toLowerCase(),
        phone,
        cedula,
        points: Number(points) || 0,
        is_cash_collector: !!is_cash_collector,
        customer_code,
        ...(password_hash ? { password_hash } : {})
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error('Admin API Users POST Error:', error);
    return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
  }
}

// PATCH: Update user status (e.g. toggle is_cash_collector)
export async function PATCH(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 });
    }

    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password; // Do not send raw password to DB
    }

    const { error } = await supabaseAdmin
      .from('participants')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (error: any) {
    console.error('Admin API Users PATCH Error:', error);
    return NextResponse.json({ error: 'Error actualizando usuario' }, { status: 500 });
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    console.error('Admin API Users DELETE Error:', error);
    return NextResponse.json({ error: 'Error eliminando usuario. Es posible que tenga boletos asociados.' }, { status: 500 });
  }
}
