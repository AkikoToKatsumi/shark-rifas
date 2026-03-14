'use client';

import { useState, useEffect } from 'react';
import BuyModal from './components/BuyModal';

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
          <h3>{loading ? '...' : metrics.active}</h3>
          <p>RIFAS ACTIVAS</p>
        </div>
        <div className="metric-card">
          <h3>{loading ? '...' : `${soldPercentage}%`}</h3>
          <p>BOLETOS VENDIDOS</p>
        </div>
        <div className="metric-card">
          <h3>{loading ? '...' : metrics.prizesTotal}</h3>
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
