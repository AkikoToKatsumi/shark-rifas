import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminSession, unauthorizedResponse } from '@/lib/auth';

// GET: Fetch all hero slides for admin (returns populated defaults if table is empty)
export async function GET(request: Request) {
  if (!await validateAdminSession()) {
    return unauthorizedResponse();
  }

  try {
    // 1. Fetch active raffle for slide 1 dynamic image
    const { data: raffles } = await supabaseAdmin
      .from('raffles')
      .select('id, title, image_url, ticket_price')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(1);

    const activeRaffle = raffles && raffles.length > 0 ? raffles[0] : null;

    const defaultSlides = [
      {
        id: 'default-1',
        badge: '⚡ RIFA DESTACADA EN VIVO',
        badge_color: '#00f2fe',
        title: activeRaffle ? activeRaffle.title : 'SORTEO PRINCIPAL SHARK RIFAS',
        subtitle: activeRaffle ? `Solo RD$${activeRaffle.ticket_price} por boleto • Sorteo oficial Pick 4 Florida al 75%.` : 'Gana increíbles premios con solo RD$100',
        image_url: activeRaffle?.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
        cta_text: '⚡ COMPRAR BOLETOS AHORA',
        link_href: '#buy',
        display_order: 1,
        is_active: true
      },
      {
        id: 'default-2',
        badge: '🎁 RECOMPENSAS DIARIAS GRATIS',
        badge_color: '#a855f7',
        title: '¡GIRA LA RULETA CADA DÍA Y ACUMULA PUNTOS!',
        subtitle: 'Ingresa solo con tu número de teléfono y obtén giros diarios gratis. Acumula puntos canjeables por boletos para las rifas.',
        image_url: '/roulette-hero.png',
        cta_text: '🎰 JUGAR RULETA GRATIS',
        link_href: '/recompensas',
        display_order: 2,
        is_active: true
      },
      {
        id: 'default-3',
        badge: '🏆 MÁS DE RD$1,500,000 EN PREMIOS',
        badge_color: '#ff8c00',
        title: 'YAMAHA YZ • SUPER GATO • RD$50,000',
        subtitle: '¡Gana RD$3,000 instantáneos con los números 1111, 2222, 3333, 4444, 5555! Además bono de RD$10,000 al Mayor Comprador.',
        image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
        cta_text: '🔥 VER DETALLES DE PREMIOS',
        link_href: '#premios-sec',
        display_order: 3,
        is_active: true
      },
      {
        id: 'default-4',
        badge: '🔍 100% TRANSPARENTE Y VERIFICABLE',
        badge_color: '#22c55e',
        title: 'CONSULTA TUS BOLETOS EN TIEMPO REAL',
        subtitle: 'Introduce tu número de teléfono en nuestro verificador de boletos para ver tus números asignados y estado de pago de forma inmediata.',
        image_url: '/verifier-hero.png',
        cta_text: '🔍 VERIFICAR BOLETOS AHORA',
        link_href: '/verificador',
        display_order: 4,
        is_active: true
      }
    ];

    const { data: slides, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !slides || slides.length === 0) {
      return NextResponse.json({ success: true, slides: defaultSlides });
    }

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
        image_url: image_url || '',
        cta_text: cta_text || 'COMPRAR BOLETOS',
        link_href: link_href || '#buy',
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

    // If updating a default slide that wasn't in DB yet, insert it into DB
    if (String(slideId).startsWith('default-')) {
      const { data, error } = await supabaseAdmin
        .from('hero_slides')
        .insert([{
          badge: updates.badge || '⚡ RIFA DESTACADA EN VIVO',
          badge_color: updates.badge_color || '#00f2fe',
          title: updates.title,
          subtitle: updates.subtitle || '',
          image_url: updates.image_url || '',
          cta_text: updates.cta_text || '⚡ COMPRAR BOLETOS AHORA',
          link_href: updates.link_href || '#buy',
          display_order: Number(updates.display_order) || 1,
          is_active: updates.is_active !== false
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Diapositiva guardada en base de datos correctamente', slide: data });
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

    if (!String(slideId).startsWith('default-')) {
      const { error } = await supabaseAdmin
        .from('hero_slides')
        .delete()
        .eq('id', slideId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Diapositiva eliminada correctamente' });
  } catch (error: any) {
    console.error('Admin API Hero DELETE Error:', error);
    return NextResponse.json({ error: 'Error al eliminar diapositiva' }, { status: 500 });
  }
}
