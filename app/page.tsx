'use client';

import { useState, useEffect } from 'react';
import BuyModal from './components/BuyModal';
import { LayoutGrid, Hash, Trophy, Users, Star, Flame, Crown } from 'lucide-react';

export default function Home() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ active: 0, ticketsSold: 0, totalPossible: 0, prizesTotal: 'RD$0' });
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
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const soldPercentage = metrics.totalPossible > 0 
    ? Math.round((metrics.ticketsSold / metrics.totalPossible) * 100)
    : 0;

  return (
    <div className="home-container container">
      {/* Metrics Section */}
      <section className="metrics-grid">
        <div className="metric-card">
          <h3 className="flex items-center justify-center gap-2"><LayoutGrid size={32} color="var(--primary-cyan)" /> {loading ? '...' : metrics.active}</h3>
          <p>RIFAS ACTIVAS</p>
        </div>
        <div className="metric-card">
          <h3 className="flex items-center justify-center gap-2"><Hash size={32} color="var(--primary-cyan)" /> {loading ? '...' : `${soldPercentage}%`}</h3>
          <p>BOLETOS VENDIDOS</p>
        </div>
        <div className="metric-card">
          <h3 className="flex items-center justify-center gap-2"><Trophy size={32} color="var(--primary-cyan)" /> {loading ? '...' : metrics.prizesTotal}</h3>
          <p>EN PREMIOS</p>
        </div>
      </section>

      {/* Raffles Section */}
      <section className="raffles-section">
        <div className="section-header">
          <h2>RIFAS DISPONIBLES</h2>
          <div className="header-line"></div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando rifas...</div>
        ) : raffles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay rifas activas en este momento. Vuelve pronto.</div>
        ) : (
          <div className="raffles-grid">
            {raffles.map((raffle) => {
              const progress = (raffle.sold / raffle.total_tickets) * 100;
              return (
                <div key={raffle.id} className="raffle-card">
                <div className="raffle-image" style={{ position: 'relative', overflow: 'hidden' }}>
                  {raffle.image_url ? (
                    <img 
                      src={raffle.image_url} 
                      alt={raffle.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '5rem',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      {raffle.emoji || '🎟️'}
                    </div>
                  )}
                </div>
                  <div className="raffle-content">
                    <h3>{raffle.title}</h3>
                    <p className="raffle-desc">{raffle.description}</p>
                    
                    <div className="raffle-info-row">
                      <div className="info-block">
                        <span className="price">RD${raffle.ticket_price}</span>
                        <span className="label">por boleto</span>
                      </div>
                      <div className="info-block align-right">
                        <span className="label">Sorteo</span>
                        <span className="date">{raffle.draw_date ? new Date(raffle.draw_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Próximamente'}</span>
                      </div>
                    </div>

                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>{progress.toFixed(0)}% Vendido</span>
                        <span style={{ fontSize: '0.7rem' }}>{raffle.sold} / {raffle.total_tickets}</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <button 
                      className="btn-primary w-full mt-auto"
                      onClick={() => setSelectedRaffle(raffle)}
                    >
                      ⚡ COMPRAR BOLETOS
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Incentives Section */}
      <section className="incentives-section">
        <div className="section-header">
          <h2>🔥 MECÁNICA DE RIFA RÁPIDA</h2>
          <div className="header-line"></div>
        </div>

        <div className="incentives-grid">
          <div className="incentive-card">
            <h3><Star className="text-orange-400" /> NÚMEROS GANADORES</h3>
            <p className="text-muted">Si te toca cualquiera de estos números al comprar tus boletos, ¡ganas <strong>RD$8,000 en efectivo</strong> al instante!</p>
            <div className="winning-numbers">
              <span className="number-chip">1111</span>
              <span className="number-chip">2222</span>
              <span className="number-chip">3333</span>
              <span className="number-chip">4444</span>
              <span className="number-chip">5555</span>
            </div>
            <p className="mt-4 text-sm" style={{ fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              * Los premios se pagan vía transferencia inmediatamente después de verificar el pago.
            </p>
          </div>

          <div className="incentive-card">
            <h3><Crown className="text-orange-400" /> MAYOR COMPRADOR</h3>
            <p className="text-muted">¡Premiamos tu fidelidad! La persona que más boletos acumule comprados para la rifa actual recibirá un bono especial.</p>
            
            <div className="bonus-prize">
              <h4>RD$10,000 ADICIONALES</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Otorgados al final del sorteo principal.</p>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--accent-orange)', fontWeight: 'bold', marginBottom: '5px' }}>¿Cómo participar?</p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Solo tienes que comprar boletos. El sistema rastrea automáticamente tu cédula y suma todos tus números.</p>
            </div>
          </div>
        </div>
      </section>

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
