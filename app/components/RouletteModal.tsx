'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, ShoppingCart, ArrowRight } from 'lucide-react';
import RouletteWheel from './RouletteWheel';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function RouletteModal() {
  const { user, loading, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showNeedPurchase, setShowNeedPurchase] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = user.last_spin_date !== today;
      const spinsToday = isNewDay ? 0 : (user.last_spin_count || 0);
      
      // Auto open if has free spin or if has a chance to spin again (but restricted for now)
      if (spinsToday === 0) {
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading]);

  const handleSpinEnd = async (points: number) => {
    setWonAmount(points);
    setErrorMsg('');
    setShowNeedPurchase(false);
    await refreshUser();
  };

  const handleSpinError = (error: string) => {
    if (error === 'NEED_PURCHASE') {
      setShowNeedPurchase(true);
    } else {
      setErrorMsg(error);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setWonAmount(null);
    setErrorMsg('');
    setShowNeedPurchase(false);
  };

  if (!isOpen || !user) return null;

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = user.last_spin_date !== today;
  const currentSpins = isNewDay ? 0 : (user.last_spin_count || 0);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, backdropFilter: 'blur(8px)' }} onClick={closeModal}>
      <div 
        className="modal-content text-center" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '450px', 
          background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
          border: '1px solid var(--primary-cyan)',
          padding: '2.5rem 1.5rem',
          boxShadow: '0 0 40px rgba(0, 242, 254, 0.2)',
          borderRadius: '24px'
        }}
      >
        <button className="modal-close" onClick={closeModal} style={{ zIndex: 50, color: '#ef4444' }}>
          <X size={24} />
        </button>

        {wonAmount !== null ? (
          <div className="animate-fade-in">
            <div style={{ display: 'inline-block', background: 'rgba(52, 211, 153, 0.1)', padding: '20px', borderRadius: '50%', color: '#34d399', marginBottom: '1rem' }}>
              <Gift size={48} />
            </div>
            <h2 style={{ color: '#34d399', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {wonAmount > 0 ? '¡Felicidades!' : '¡Oops!'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              {wonAmount > 0 
                ? <>Has ganado <strong>{wonAmount} puntos</strong>.</>
                : 'Hoy no hubo suerte.'}
            </p>

            {currentSpins === 1 ? (
              <div style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px dashed var(--primary-cyan)', padding: '1.5rem', borderRadius: '15px', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--primary-cyan)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles size={20} /> ¡TE QUEDA UN CHANCE!
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Prueba tu suerte comprando cualquier boleto ahora mismo para activar tu **segundo giro** de hoy.
                </p>
                <Link href="/" onClick={closeModal} className="btn-accent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
                  <ShoppingCart size={18} /> COMPRAR BOLETO <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ya has usado todos tus giros de hoy. ¡Vuelve mañana!</p>
            )}

            <button className="btn-secondary w-full" onClick={closeModal}>
              CERRAR
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex justify-center mb-2">
              <span style={{ 
                background: 'rgba(0, 242, 254, 0.1)', 
                color: 'var(--primary-cyan)', 
                padding: '5px 15px', 
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Sparkles size={14} /> RECOMPENSA DIARIA
              </span>
            </div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Gira y Gana</h2>
            
            {(errorMsg || showNeedPurchase) && (
              <div style={{ 
                background: showNeedPurchase ? 'rgba(255, 140, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                color: showNeedPurchase ? 'var(--accent-orange)' : '#ef4444', 
                padding: '1rem', 
                borderRadius: '12px', 
                fontSize: '0.9rem', 
                marginBottom: '1rem',
                border: `1px solid ${showNeedPurchase ? 'rgba(255, 140, 0, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {showNeedPurchase ? (
                  <div>
                    <strong>¡Chance Extra Bloqueado!</strong><br/>
                    Para girar por segunda vez hoy, necesitas comprar al menos un boleto.
                    <div style={{ marginTop: '10px' }}>
                      <Link href="/" onClick={closeModal} style={{ color: 'var(--primary-cyan)', fontWeight: 'bold', textDecoration: 'underline' }}>
                        Ir a comprar boletos →
                      </Link>
                    </div>
                  </div>
                ) : errorMsg}
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {currentSpins === 0 
                ? '¡Gira ahora GRATIS y gana puntos acumulables!' 
                : 'Has activado tu segundo giro diario. ¡Buena suerte!'}
            </p>

            <RouletteWheel onSpinEnd={handleSpinEnd} onSpinError={handleSpinError} disabled={false} />
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
              {currentSpins === 0 
                ? 'Primer giro diario gratis. El segundo requiere una compra.'
                : 'Este es tu último giro de hoy.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
