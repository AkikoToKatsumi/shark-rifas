'use client';

import { useState, useEffect } from 'react';

// Mock Data for Winners
const WINNERS_DATA = [
  {
    id: 1,
    name: 'José Martínez',
    prize: 'Gipeta Honda CR-V 2023',
    ticket: '7492',
    date: '15 de Diciembre, 2025',
    image: '/YZ AZUL.jpg', // Reusing available assets for mock
    description: '¡Felicidades a José de Santiago por llevarse el gran premio de la noche!'
  },
  {
    id: 2,
    name: 'Carmen Rosario',
    prize: 'iPhone 15 Pro Max',
    ticket: '1058',
    date: '28 de Noviembre, 2025',
    image: '/IPHONE.jpg', // Reusing available assets for mock
    description: 'Nuestra ganadora del combo tecnológico. ¡Gracias por confiar en Shark RD!'
  },
  {
    id: 3,
    name: 'Luis Almonte',
    prize: 'RD$ 500,000 en Efectivo',
    ticket: '5533',
    date: '10 de Noviembre, 2025',
    image: '/YZ AZUL.jpg', // Reusing available assets
    description: 'Medio millón de pesos entregados en efectivo. ¡Shark RD sí cumple!'
  }
];

export default function GanadoresPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % WINNERS_DATA.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % WINNERS_DATA.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + WINNERS_DATA.length) % WINNERS_DATA.length);
  };

  return (
    <div className="winners-container container text-center">
      <div className="section-header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
        <h2 className="text-3xl">🏆 GALERÍA DE GANADORES</h2>
      </div>
      
      <p className="text-muted mb-8 max-w-2xl mx-auto">
        Conoce a las personas que ya han cambiado su suerte con Shark RD. ¡El próximo podrías ser tú! 
        Aquí mostramos las entregas oficiales de nuestros premios más recientes.
      </p>

      {/* Carousel Section */}
      <div className="carousel-wrapper">
        <div 
          className="carousel-inner"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {WINNERS_DATA.map((winner) => (
            <div key={winner.id} className="carousel-slide">
              <img src={winner.image} alt={winner.prize} className="carousel-img" />
              
              <div className="carousel-caption">
                <div className="caption-content text-left">
                  <h3>{winner.prize}</h3>
                  <p className="winner-details">
                    <strong>Ganador:</strong> {winner.name} <br/>
                    <strong>Boleto:</strong> #{winner.ticket}
                  </p>
                  <p className="text-gray-300 text-sm mb-2">{winner.description}</p>
                  <p className="winner-date">{winner.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <button className="carousel-control prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="carousel-control next" onClick={nextSlide}>
          ❯
        </button>

        </div>
      {/* End carousel-wrapper */}

      {/* Indicators (moved outside) */}
      <div className="carousel-indicators-outer">
        {WINNERS_DATA.map((_, index) => (
          <button
            key={index}
            className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="mt-20 mb-12">
         <button 
           className="btn-accent" 
           style={{ padding: '15px 30px', fontSize: '1rem', borderRadius: '12px' }}
           onClick={() => window.location.href = '/'}
         >
            ¡QUIERO PARTICIPAR EN LA PRÓXIMA RIFA!
         </button>
      </div>
      
    </div>
  );
}
