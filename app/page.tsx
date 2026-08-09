'use client';

import { useState, useEffect } from 'react';
import BuyModal from './components/BuyModal';
import FAQ from './components/FAQ';
import CountdownTimer from './components/CountdownTimer';
import RouletteModal from './components/RouletteModal';
import HeroSlider from './components/HeroSlider';
import { Trophy, Users, Star, Flame, Crown, Sparkles } from 'lucide-react';

export default function Home() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaffle, setSelectedRaffle] = useState<any>(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await fetch('/api/raffles');
      const data = await res.json();
      if (data.success) {
        setRaffles(data.raffles || []);
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Daily Roulette Pop-up */}
      <RouletteModal />

      {/* Hero Slider Section */}
      <HeroSlider 
        raffles={raffles} 
        onSelectRaffle={(raffle) => setSelectedRaffle(raffle)} 
      />

      {/* Raffles Section */}
      <section id="rifas-sec" className="raffles-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="raffles-header-wrapper">
          <div className="raffles-title-badge">
            <Sparkles size={13} />
            <span>SORTEOS OFICIALES</span>
          </div>
          <h2 className="raffles-main-title">RIFAS DISPONIBLES</h2>
          <div className="raffles-notice-pill">
            <span className="notice-dot"></span>
            <span>Todos los sorteos se efectuarán al alcanzar el 75% de ventas</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-3 text-muted">Cargando rifas...</div>
        ) : raffles.length === 0 ? (
          <div className="text-center p-3 text-muted">No hay rifas activas en este momento. Vuelve pronto.</div>
        ) : (
          <div className="raffles-grid">
            {raffles.map((raffle, idx) => {
              const progress = (raffle.sold / raffle.total_tickets) * 100;
              return (
                <div key={raffle.id} className="raffle-card animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
                  <div className="raffle-image raffle-img-container">
                    {raffle.image_url ? (
                      <img
                        src={raffle.image_url}
                        alt={raffle.title}
                        className="raffle-img"
                      />
                    ) : (
                      <div className="placeholder-emoji">
                        {raffle.emoji || '🎟️'}
                      </div>
                    )}
                  </div>
                  <div className="raffle-content">
                    <h3>{raffle.title}</h3>
                    <div className="raffle-desc raffle-description" dangerouslySetInnerHTML={{ __html: raffle.description || '' }} />

                    <div className="raffle-info-row">
                      <div className="info-block">
                        <span className="price">RD${raffle.ticket_price}</span>
                        <span className="label">por boleto</span>
                      </div>
                      <div className="info-block align-right">
                        <span className="label">Sorteo</span>
                        <span className="date">{raffle.draw_date ? new Date(raffle.draw_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Próximamente'}</span>
                        {raffle.draw_date && <CountdownTimer targetDate={raffle.draw_date} />}
                      </div>
                    </div>

                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>{progress.toFixed(0)}% Vendido</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    {progress >= 100 ? (
                      <button
                        className="btn-primary w-full mt-auto status-paid border-none cursor-not-allowed opacity-9"
                        style={{ color: '#000' }}
                        disabled
                      >
                        🎉 COMPLETADA
                      </button>
                    ) : raffle.is_paused ? (
                      <button
                        className="btn-primary w-full mt-auto status-pending border-none cursor-not-allowed opacity-9"
                        style={{ color: '#000' }}
                        disabled
                      >
                        ⏸️ VENTAS PAUSADAS
                      </button>
                    ) : (
                      <button
                        className="btn-primary w-full mt-auto"
                        onClick={() => setSelectedRaffle(raffle)}
                      >
                        ⚡ COMPRAR BOLETOS
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Incentives Section */}
      <section id="premios-sec" className="incentives-section">
        <div className="section-header flex-center">
          <h2>🔥 PREMIOS 🔥</h2>
        </div>

        <div className="incentives-grid">
          <div className="incentive-card">
            <h3><Trophy className="text-orange-400" /> PREMIOS EN TOTAL</h3>
            <p className="text-muted">¡Estos son los increíbles premios que tenemos para ti en este sorteo principal!</p>
            <div className="prizes-list">
              <div className="prize-item">
                <span className="prize-rank">1er Lugar</span>
                <span className="prize-name">Yamaha YZ o Kawasaki KX</span>
              </div>
              <div className="prize-item">
                <span className="prize-rank">2do Lugar</span>
                <span className="prize-name">Super Gato Bengala</span>
              </div>
              <div className="prize-item">
                <span className="prize-rank">3er Lugar</span>
                <span className="prize-name">RD$50,000</span>
              </div>
              <div className="prize-item">
                <span className="prize-rank">4to Lugar</span>
                <span className="prize-name">RD$25,000</span>
              </div>

            </div>
          </div>

          <div className="incentive-card">
            <h3><Star className="text-orange-400" /> NÚMEROS GANADORES</h3>
            <p className="text-muted">Si te toca cualquiera de estos números al comprar tus boletos, ¡ganas <strong>RD$3,000 en efectivo</strong> al instante!</p>
            <div className="winning-numbers">
              <span className="number-chip">1111</span>
              <span className="number-chip">2222</span>
              <span className="number-chip">3333</span>
              <span className="number-chip">4444</span>
              <span className="number-chip">5555</span>
            </div>
            <p className="mt-4 text-sm font-italic border-top-faint" style={{ paddingTop: '10px' }}>
              * Los premios se pagan vía transferencia inmediatamente después de verificar el pago.
            </p>
          </div>

          <div className="incentive-card">
            <h3><Crown className="text-orange-400" /> BONO AL MAYOR COMPRADOR</h3>
            <p className="text-muted">¡Premiamos tu fidelidad! La persona que más boletos acumule comprados para la rifa actual recibirá un bono especial.</p>

            <div className="bonus-prize">
              <h4>RD$10,000 ADICIONALES</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Otorgados al final del sorteo principal.</p>
            </div>

            <div className="mt-20 p-2 glass-panel" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px' }}>
              <p style={{ color: 'var(--accent-orange)', fontWeight: 'bold', marginBottom: '5px' }}>¿Cómo participar?</p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Solo tienes que comprar boletos. El sistema rastrea automáticamente tu cédula y suma todos tus números.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {selectedRaffle && (
        <BuyModal
          raffle={{
            ...selectedRaffle,
            price: selectedRaffle.ticket_price // Adapt to what BuyModal expects
          }}
          onClose={() => setSelectedRaffle(null)}
        />
      )}
    </div>
  );
}
