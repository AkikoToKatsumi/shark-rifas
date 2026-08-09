import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Default slides in case database table is empty or being initialized
const DEFAULT_HERO_SLIDES = [
  {
    id: 'default-1',
    badge: '⚡ RIFA DESTACADA EN VIVO',
    badge_color: '#00f2fe',
    title: 'FELICES X3 (Yamaha YZ / Super Gato / RD$50,000)',
    subtitle: 'Solo RD$100 por boleto • Sorteo oficial Pick 4 Florida al alcanzar el 75% vendido.',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    cta_text: '⚡ COMPRAR BOLETOS AHORA',
    link_href: '#rifas-sec',
    display_order: 1,
    is_active: true
  },
  {
    id: 'default-2',
    badge: '🏆 MÁS DE RD$1,500,000 EN PREMIOS',
    badge_color: '#ff8c00',
    title: 'YAMAHA YZ • SUPER GATO • RD$50,000',
    subtitle: '¡Gana RD$3,000 instantáneos con los números 1111, 2222, 3333, 4444, 5555! Además bono de RD$10,000 al Mayor Comprador.',
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    cta_text: '🔥 VER DETALLES DE PREMIOS',
    link_href: '#premios-sec',
    display_order: 2,
    is_active: true
  },
  {
    id: 'default-3',
    badge: '🔍 100% TRANSPARENTE Y VERIFICABLE',
    badge_color: '#22c55e',
    title: 'CONSULTA TUS BOLETOS EN TIEMPO REAL',
    subtitle: 'Introduce tu número de teléfono en nuestro verificador de boletos para ver tus números asignados y estado de pago de forma inmediata.',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    cta_text: '🔍 VERIFICAR BOLETOS AHORA',
    link_href: '/verificador',
    display_order: 3,
    is_active: true
  },
  {
    id: 'default-4',
    badge: '🎁 RECOMPENSAS DIARIAS GRATIS',
    badge_color: '#a855f7',
    title: '¡GIRA LA RULETA CADA DÍA Y ACUMULA PUNTOS!',
    subtitle: 'Ingresa solo con tu número de teléfono y obtén giros diarios gratis. Acumula puntos canjeables por boletos para las rifas.',
    image_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
    cta_text: '🎰 JUGAR RULETA GRATIS',
    link_href: '/recompensas',
    display_order: 4,
    is_active: true
  }
];

export async function GET() {
  try {
    const { data: slides, error } = await supabaseAdmin
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !slides || slides.length === 0) {
      return NextResponse.json({ success: true, slides: DEFAULT_HERO_SLIDES });
    }

    return NextResponse.json({ success: true, slides });
  } catch (error) {
    console.error('Public Hero GET Error:', error);
    return NextResponse.json({ success: true, slides: DEFAULT_HERO_SLIDES });
  }
}
