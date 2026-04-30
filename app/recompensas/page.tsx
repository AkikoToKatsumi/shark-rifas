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

  const getSpinState = () => {
    if (!user) return 'loading';
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user.last_spin_date !== today;
    const spinsToday = isNewDay ? 0 : (user.last_spin_count || 0);

    if (spinsToday === 0) return 'ready-free';
    if (spinsToday >= 2) return 'completed';
    
    // If 1 spin done, check for purchase
    if (user.has_paid_ticket_today) return 'ready-second';
    if (user.has_pending_ticket_today) return 'waiting-approval';
    
    return 'need-purchase';
  };

  const spinState = getSpinState();

  return (
    <div className="section rewards-container flex-col flex-center">
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <div className="header-badge rewards-badge">
        <Sparkles size={16} /> SISTEMA DE RECOMPENSAS
      </div>
      
      <h2 className="section-title text-center mb-10">Gira y Gana <span className="highlight-text">Boletos Gratis</span></h2>
      <p className="text-center text-muted max-w-600 mb-20" style={{ marginBottom: '1.5rem' }}>
        Acumula puntos todos los días y canjéalos por boletos en tus rifas favoritas. 
        <br/><strong>500 puntos = 1 Boleto Gratis.</strong>
      </p>

      {!user ? (
        <div className="card card-auth-needed text-center p-3-2 max-w-500 m-auto">
          <Gift size={48} className="primary-cyan mb-10" style={{ color: 'var(--primary-cyan)' }} />
          <h3>Inicia Sesión para Jugar</h3>
          <p className="text-muted mb-20">
            Necesitas una cuenta para guardar tus puntos y usarlos luego.
          </p>
          <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
            INICIAR SESIÓN / REGISTRO
          </button>
        </div>
      ) : (
        <div className="w-full max-w-800 flex-col flex-center">
          <div className="stats-grid rewards-stats-grid mb-20">
            <div className="card stat-card reward-stat-card">
              <div className="stat-icon-box icon-points">
                <WalletCards size={24} />
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Tus Puntos</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{user.points || 0}</h3>
              </div>
            </div>
            <div className="card stat-card reward-stat-card">
              <div className="stat-icon-box icon-gifts">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Boletos Disponibles</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{Math.floor((user.points || 0) / 500)}</h3>
              </div>
            </div>
          </div>

          {wonAmount !== null ? (
            <div className="card win-card animate-fade-in text-center p-2 mb-20">
              <h3 style={{ color: '#34d399', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {wonAmount > 0 ? `¡Felicidades! 🎉` : '¡Sigue intentando!'}
              </h3>
              <p>
                {wonAmount > 0 ? `Acabas de ganar ${wonAmount} puntos para tu cuenta.` : 'Hoy no hubo suerte, ¡pero vuelve mañana para volver a jugar!'}
              </p>
              <button className="btn-secondary mt-1" onClick={() => setWonAmount(null)}>VOLVER</button>
            </div>
          ) : (
            <div className="w-full relative" style={{ position: 'relative' }}>
              {spinState === 'completed' && (
                <div className="overlay-container overlay-completed flex-center">
                  <div className="card text-center max-w-350" style={{ border: '1px solid var(--primary-cyan)' }}>
                    <h3>¡Vuelve Mañana! ⏰</h3>
                    <p className="text-muted">Ya has usado tus 2 giros de hoy. ¡Mañana tendrás una nueva oportunidad!</p>
                  </div>
                </div>
              )}

              {spinState === 'waiting-approval' && (
                <div className="overlay-container overlay-waiting flex-center">
                  <div className="card text-center max-w-350" style={{ border: '1px solid var(--accent-orange)' }}>
                    <h3 style={{ color: 'var(--accent-orange)' }}>Pago Pendiente ⏳</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Hemos recibido tu compra. Tu segundo giro se activará automáticamente cuando un administrador apruebe tu pago.</p>
                    <p className="primary-cyan" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>¡Te avisaremos por correo!</p>
                  </div>
                </div>
              )}

              {spinState === 'need-purchase' && (
                <div className="overlay-container overlay-need-purchase flex-center">
                  <div className="card text-center max-w-350" style={{ border: '1px solid var(--primary-cyan)' }}>
                    <h3 className="flex-center" style={{ gap: '8px' }}>
                      <Sparkles size={20} color="var(--primary-cyan)" /> ¡CHANCE EXTRA!
                    </h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Ya realizaste tu giro gratis. Compra cualquier boleto hoy para desbloquear un **segundo giro** inmediato.</p>
                    <a href="/" className="btn-primary w-full mt-10" style={{ display: 'block', textDecoration: 'none' }}>COMPRAR BOLETO ⚡</a>
                  </div>
                </div>
              )}

              <RouletteWheel 
                onSpinEnd={handleSpinEnd} 
                disabled={spinState === 'completed' || spinState === 'waiting-approval' || spinState === 'need-purchase'} 
              />
              
              <div className="text-center mt-10" style={{ marginTop: '1.5rem' }}>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {spinState === 'ready-free' && "🎁 Tienes 1 giro gratis disponible."}
                  {spinState === 'ready-second' && "⚡ ¡Pago aprobado! Tienes tu segundo giro listo."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
