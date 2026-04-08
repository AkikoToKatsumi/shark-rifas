'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift } from 'lucide-react';
import RouletteWheel from './RouletteWheel';
import { useAuth } from '../context/AuthContext';

export default function RouletteModal() {
  const { user, loading, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  useEffect(() => {
    // Determine if we should open the modal automatically
    if (!loading && user) {
      const today = new Date().toISOString().split('T')[0];
      const hasSpunToday = (user as any).last_spin_date === today;
      
      // If haven't spun today, show modal automatically on load
      if (!hasSpunToday) {
        // Small delay so it pops up nicely after page load
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading]);

  const handleSpinEnd = async (points: number) => {
    setWonAmount(points);
    await refreshUser(); // Update balance and last_spin_date in context
  };

  const closeModal = () => {
    setIsOpen(false);
    // If they won something, refresh just in case
    if (wonAmount !== null) {
      setWonAmount(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, backdropFilter: 'blur(8px)' }} onClick={closeModal}>
      <div 
        className="modal-content text-center" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '450px', 
          background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
          border: '1px solid var(--primary-cyan)',
          padding: '2rem',
          boxShadow: '0 0 30px rgba(0, 242, 254, 0.2)'
        }}
      >
        <button className="modal-close" onClick={closeModal} style={{ zIndex: 50 }}>
          <X size={24} />
        </button>

        {wonAmount !== null ? (
          <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'inline-block', background: 'rgba(52, 211, 153, 0.1)', padding: '20px', borderRadius: '50%', color: '#34d399', marginBottom: '1rem' }}>
              <Gift size={48} />
            </div>
            <h2 style={{ color: '#34d399', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {wonAmount > 0 ? '¡Felicidades!' : '¡Oops!'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2rem' }}>
              {wonAmount > 0 
                ? <>Has ganado <strong>{wonAmount} puntos</strong>.<br/>Ya están añadidos a tu cuenta.</>
                : 'Hoy no hubo suerte. ¡Vuelve a intentarlo mañana!'}
            </p>
            <button className="btn-primary w-full" onClick={closeModal}>
              CERRAR Y CONTINUAR
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
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Sparkles size={14} /> RECOMPENSA DIARIA
              </span>
            </div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Gira y Gana</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              ¡Gira la ruleta gratis todos los días para ganar puntos y canjearlos por boletos reales!
            </p>

            <RouletteWheel onSpinEnd={handleSpinEnd} disabled={false} />
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
              Los puntos ganados se añadirán directamente a tu saldo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
