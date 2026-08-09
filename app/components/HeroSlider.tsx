'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Gift, Zap, Sparkles, Star, Crown, Search } from 'lucide-react';
import Link from 'next/link';

interface HeroSliderProps {
  raffles: any[];
  onSelectRaffle?: (raffle: any) => void;
}

export default function HeroSlider({ raffles, onSelectRaffle }: HeroSliderProps) {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredRaffle = raffles.length > 0 ? raffles[0] : null;

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/hero');
      const data = await res.json();
      if (data.success && data.slides && data.slides.length > 0) {
        setSlides(data.slides);
      }
    } catch (err) {
      console.error('Error fetching hero slides:', err);
    }
  };

  // Default slides fallback
  const defaultSlides = [
    {
      id: 'active-raffle',
      badge: '⚡ RIFA DESTACADA EN VIVO',
      badge_color: '#00f2fe',
      title: featuredRaffle ? featuredRaffle.title : 'SORTEO PRINCIPAL SHARK RIFAS',
      subtitle: featuredRaffle ? `Solo RD$${featuredRaffle.ticket_price} por boleto • Sorteo Pick 4 Florida al 75%` : 'Gana increíbles premios con solo RD$100',
      image_url: featuredRaffle?.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
      cta_text: '⚡ COMPRAR BOLETOS AHORA',
      link_href: '#buy',
      isRaffleCta: true
    },
    {
      id: 'prizes-info',
      badge: '🏆 MÁS DE RD$1,500,000 EN PREMIOS',
      badge_color: '#ff8c00',
      title: 'YAMAHA YZ • SUPER GATO • RD$50,000',
      subtitle: '¡Gana RD$3,000 instantáneos con los números 1111, 2222, 3333, 4444, 5555! Además bono de RD$10,000 al Mayor Comprador.',
      image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
      cta_text: '🔥 VER DETALLES DE PREMIOS',
      link_href: '#premios-sec'
    },
    {
      id: 'verifier-info',
      badge: '🔍 100% TRANSPARENTE Y VERIFICABLE',
      badge_color: '#22c55e',
      title: 'CONSULTA TUS BOLETOS EN TIEMPO REAL',
      subtitle: 'Introduce tu número de teléfono en nuestro verificador de boletos para ver tus números asignados y estado de pago de forma inmediata.',
      image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      cta_text: '🔍 VERIFICAR BOLETOS AHORA',
      link_href: '/verificador'
    },
    {
      id: 'roulette-info',
      badge: '🎁 RECOMPENSAS DIARIAS GRATIS',
      badge_color: '#a855f7',
      title: '¡GIRA LA RULETA CADA DÍA Y ACUMULA PUNTOS!',
      subtitle: 'Ingresa solo con tu número de teléfono y obtén giros diarios gratis. Acumula puntos canjeables por boletos para las rifas.',
      image_url: '/roulette-hero.png',
      cta_text: '🎰 JUGAR RULETA GRATIS',
      link_href: '/recompensas'
    }
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Autoplay slider every 6 seconds
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const slide = activeSlides[currentSlide] || activeSlides[0];

  // Dynamically resolve image for active raffle slide
  const currentImageUrl = (slide.id === 'active-raffle' || slide.link_href === '#buy') && featuredRaffle?.image_url
    ? featuredRaffle.image_url
    : (slide.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80');

  const handleCtaClick = (e: React.MouseEvent) => {
    const targetHref = slide.link_href;

    if (targetHref === '#buy' || slide.isRaffleCta) {
      e.preventDefault();
      if (featuredRaffle && onSelectRaffle) {
        onSelectRaffle(featuredRaffle);
      } else {
        document.getElementById('rifas-sec')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (targetHref?.startsWith('#')) {
      e.preventDefault();
      const targetId = targetHref.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="hero-slider-wrapper">
      <div className="hero-slider-card">
        {/* Background Image Full Cover */}
        <div 
          className="hero-slider-bg"
          style={{ backgroundImage: `url(${currentImageUrl})` }}
        ></div>
        <div className="hero-slider-overlay"></div>

        {/* Content Box Overlay */}
        <div className="hero-slider-content">
          <div className="hero-badge" style={{ borderColor: slide.badge_color || '#00f2fe', color: slide.badge_color || '#00f2fe' }}>
            <Sparkles size={14} /> {slide.badge}
          </div>

          <h2 className="hero-slide-title">
            {slide.title}
          </h2>

          <p className="hero-slide-subtitle">
            {slide.subtitle}
          </p>

          {/* Optional Progress stats for featured raffle slide */}
          {featuredRaffle && (slide.id === 'active-raffle' || slide.link_href === '#buy') && (
            <div className="hero-extra-stats">
              <div className="hero-stat-item">
                <span className="stat-label">Precio</span>
                <span className="stat-val primary-cyan">RD${featuredRaffle.ticket_price}</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-label">Progreso</span>
                <span className="stat-val accent-orange">
                  {Math.round((featuredRaffle.sold / featuredRaffle.total_tickets) * 100)}% Vendido
                </span>
              </div>
            </div>
          )}

          {/* CTA Action */}
          <div className="hero-cta-box">
            {slide.link_href === '#buy' || slide.isRaffleCta ? (
              <button 
                onClick={handleCtaClick}
                className="btn-primary hero-btn"
              >
                <Zap size={20} /> {slide.cta_text || '⚡ COMPRAR BOLETOS AHORA'}
              </button>
            ) : slide.link_href?.startsWith('/') ? (
              <Link href={slide.link_href} className="btn-primary hero-btn">
                <Gift size={20} /> {slide.cta_text || 'VER MÁS'}
              </Link>
            ) : (
              <a href={slide.link_href || '#'} onClick={handleCtaClick} className="btn-primary hero-btn">
                <Trophy size={20} /> {slide.cta_text || 'VER MÁS'}
              </a>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button onClick={prevSlide} className="hero-arrow arrow-left" title="Anterior">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="hero-arrow arrow-right" title="Siguiente">
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {activeSlides.length > 1 && (
          <div className="hero-dots">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`hero-dot ${currentSlide === idx ? 'active' : ''}`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
