import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminSession, unauthorizedResponse } from '@/lib/auth';

// GET: Fetch all hero slides (including inactive)
export async function GET(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const { data: slides, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, slides });
  } catch (error: any) {
    console.error('Admin API Hero GET Error:', error);
    return NextResponse.json({ error: 'Error al obtener diapositivas' }, { status: 500 });
  }
}

// POST: Create a new hero slide
export async function POST(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { badge, badge_color, title, subtitle, image_url, cta_text, link_href, display_order, is_active } = body;

    if (!title) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .insert([{
        badge: badge || '⚡ NUEVO SORTEO',
        badge_color: badge_color || '#00f2fe',
        title,
        subtitle: subtitle || '',
        image_url: image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
        cta_text: cta_text || 'COMPRAR BOLETOS',
        link_href: link_href || '#rifas-sec',
        display_order: Number(display_order) || 0,
        is_active: is_active !== false
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, slide: data });
  } catch (error: any) {
    console.error('Admin API Hero POST Error:', error);
    return NextResponse.json({ error: 'Error al crear diapositiva' }, { status: 500 });
  }
}

// PATCH: Update an existing hero slide
export async function PATCH(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { slideId, updates } = body;

    if (!slideId || !updates) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('hero_slides')
      .update(updates)
      .eq('id', slideId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Diapositiva actualizada correctamente' });
  } catch (error: any) {
    console.error('Admin API Hero PATCH Error:', error);
    return NextResponse.json({ error: 'Error al actualizar diapositiva' }, { status: 500 });
  }
}

// DELETE: Delete a hero slide
export async function DELETE(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    const { slideId } = await request.json();

    if (!slideId) {
      return NextResponse.json({ error: 'ID de diapositiva requerido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('hero_slides')
      .delete()
      .eq('id', slideId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Diapositiva eliminada correctamente' });
  } catch (error: any) {
    console.error('Admin API Hero DELETE Error:', error);
    return NextResponse.json({ error: 'Error al eliminar diapositiva' }, { status: 500 });
  }
}
