import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
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

    const { data: dbSlides, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !dbSlides || dbSlides.length === 0) {
      return NextResponse.json({ success: true, slides: defaultSlides });
    }

    // Attach active raffle image to first slide if it's configured for the raffle
    const finalSlides = dbSlides.map((s, idx) => {
      if ((idx === 0 || s.link_href === '#buy' || s.link_href === '#rifas-sec') && activeRaffle?.image_url && !s.image_url) {
        return { ...s, image_url: activeRaffle.image_url };
      }
      return s;
    });

    return NextResponse.json({ success: true, slides: finalSlides });
  } catch (error) {
    console.error('Public Hero GET Error:', error);
    return NextResponse.json({ success: true, slides: [] });
  }
}
