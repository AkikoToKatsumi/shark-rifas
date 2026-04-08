'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

const ROULETTE_OPTIONS = [
  { value: 0, label: '¡Casi!', emoji: '😭', color: '#334155', textColor: '#94a3b8' },
  { value: 10, label: '10', emoji: '🍬', color: '#0ea5e9', textColor: '#ffffff' },
  { value: 20, label: '20', emoji: '🍔', color: '#22c55e', textColor: '#ffffff' },
  { value: 50, label: '50', emoji: '🍕', color: '#f59e0b', textColor: '#ffffff' },
  { value: 100, label: '100', emoji: '💎', color: '#a855f7', textColor: '#ffffff' },
  { value: 200, label: '200', emoji: '👑', color: '#eab308', textColor: '#ffffff' },
];

type RouletteProps = {
  onSpinEnd: (points: number) => void;
  disabled?: boolean;
};

export default function RouletteWheel({ onSpinEnd, disabled }: RouletteProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = async () => {
    if (spinning || disabled) return;
    setSpinning(true);

    try {
      // Pedimos al backend el resultado para que sea seguro
      const res = await fetch('/api/rewards/spin', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        setSpinning(false);
        return;
      }

      // Animación visual calculando los grados según la opción ganadora
      const winnerIndex = ROULETTE_OPTIONS.findIndex(o => o.value === data.pointsWon);
      const degreePerSlice = 360 / ROULETTE_OPTIONS.length;
      
      // 5 vueltas completas + la posición del ganador (invertido porque gira en sentido horario y css)
      const targetDegree = rotation + (360 * 5) + (360 - (winnerIndex * degreePerSlice));

      setRotation(targetDegree);

      // Esperar a que termine la animación css (5s)
      setTimeout(() => {
        setSpinning(false);
        if (data.pointsWon > 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        onSpinEnd(data.pointsWon);
      }, 5000);

    } catch (error) {
      alert('Error de conexión');
      setSpinning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
      
      {/* Pointer */}
      <div style={{
        width: 0, 
        height: 0, 
        borderLeft: '15px solid transparent',
        borderRight: '15px solid transparent',
        borderTop: '25px solid var(--primary-cyan)',
        marginBottom: '-10px',
        zIndex: 10
      }}></div>

      {/* Wheel */}
      <div 
        style={{
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)',
          transform: `rotate(${rotation}deg)`,
          boxShadow: '0 0 30px rgba(0, 242, 254, 0.6), inset 0 0 20px rgba(0,0,0,0.8), 0 0 0 10px rgba(255,255,255,0.05)',
          border: '4px solid var(--primary-cyan)',
          background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)'
        }}
      >
        {ROULETTE_OPTIONS.map((opt, i) => {
          const rotationAngle = i * (360 / ROULETTE_OPTIONS.length);
          const skewAngle = 90 - (360 / ROULETTE_OPTIONS.length);

          return (
            <div 
              key={i} 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '50%',
                transformOrigin: '0% 100%',
                transform: `rotate(${rotationAngle}deg) skewY(-${skewAngle}deg)`,
                backgroundColor: opt.color,
                border: '2px solid rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 0 15px rgba(255,255,255,0.1)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `skewY(${skewAngle}deg) rotate(${360 / ROULETTE_OPTIONS.length / 2}deg) translate(-50%, -50%)`,
                textAlign: 'center',
                color: opt.textColor,
                fontWeight: '900',
                fontSize: opt.value === 0 ? '0.9rem' : '1.4rem',
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                minWidth: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}>
                <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}>{opt.emoji}</span>
                <span>{opt.label}{opt.value > 0 ? ' pts' : ''}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        className="btn-primary" 
        onClick={spin} 
        disabled={spinning || disabled}
        style={{ 
          marginTop: '2.5rem', 
          padding: '18px 45px', 
          fontSize: '1.3rem', 
          fontWeight: 'bold',
          letterSpacing: '2px', 
          borderRadius: '50px',
          boxShadow: '0 10px 20px rgba(0, 242, 254, 0.4), inset 0 -3px 0 rgba(0,0,0,0.2)',
          transform: spinning || disabled ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.6 : 1,
          background: 'linear-gradient(135deg, var(--primary-cyan) 0%, #00b4d8 100%)',
          color: '#000'
        }}
      >
        {spinning ? 'GIRANDO...' : '¡GIRAR RULETA!'}
      </button>
    </div>
  );
}
