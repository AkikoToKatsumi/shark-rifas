'use client';

import React, { useEffect, useState } from 'react';
import RouletteWheel from '../components/RouletteWheel';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { Gift, WalletCards, Sparkles } from 'lucide-react';

export default function RecompensasPage() {
  const { user, refreshUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  useEffect(() => {
    // Only scroll to top on first render
    window.scrollTo(0, 0);
  }, []);

  const handleSpinEnd = async (points: number) => {
    setWonAmount(points);
    await refreshUser(); // Update points and last_spin_date
  };

  const hasSpunToday = () => {
    if (!user || !(user as any).last_spin_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return (user as any).last_spin_date === today;
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <div className="header-badge" style={{ marginBottom: '1rem' }}>
        <Sparkles size={16} /> SISTEMA DE RECOMPENSAS
      </div>
      
      <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Gira y Gana <span className="highlight-text">Boletos Gratis</span></h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
        Acumula puntos todos los días y canjéalos por boletos en tus rifas favoritas. 
        <br/><strong>500 puntos = 1 Boleto Gratis.</strong>
      </p>

      {!user ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '500px', margin: '0 auto', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
          <Gift size={48} style={{ color: 'var(--primary-cyan)', marginBottom: '1rem' }} />
          <h3>Inicia Sesión para Jugar</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Necesitas una cuenta para guardar tus puntos y usarlos luego.
          </p>
          <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
            INICIAR SESIÓN / REGISTRO
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="stats-grid" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', width: '100%', justifyContent: 'center' }}>
            <div className="stat-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '250px' }}>
              <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '15px', borderRadius: '50%', color: 'var(--primary-cyan)' }}>
                <WalletCards size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tus Puntos</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{user.points || 0}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '250px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '15px', borderRadius: '50%', color: '#a855f7' }}>
                <Gift size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Boletos Disponibles</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{Math.floor((user.points || 0) / 500)}</h3>
              </div>
            </div>
          </div>

          {wonAmount !== null ? (
            <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', marginBottom: '2rem' }}>
              <h3 style={{ color: '#34d399', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {wonAmount > 0 ? `¡Felicidades! 🎉` : '¡Sigue intentando!'}
              </h3>
              <p>
                {wonAmount > 0 ? `Acabas de ganar ${wonAmount} puntos para tu cuenta.` : 'Hoy no hubo suerte, ¡pero vuelve mañana para volver a jugar!'}
              </p>
              <button className="btn-secondary" onClick={() => setWonAmount(null)} style={{ marginTop: '1rem' }}>VOLVER</button>
            </div>
          ) : (
            <div style={{ width: '100%', position: 'relative' }}>
              {hasSpunToday() && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(5px)', borderRadius: '20px' }}>
                  <div className="card" style={{ textAlign: 'center', border: '1px solid var(--primary-cyan)' }}>
                    <h3>¡Vuelve Mañana! ⏰</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Ya giraste la ruleta hoy. Obtén más intentos gratis cada 24 horas.</p>
                  </div>
                </div>
              )}
              <RouletteWheel onSpinEnd={handleSpinEnd} disabled={hasSpunToday()} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
