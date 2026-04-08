'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

const ROULETTE_OPTIONS = [0, 10, 20, 50, 100, 200];

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
      const winnerIndex = ROULETTE_OPTIONS.indexOf(data.pointsWon);
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
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)',
          transform: `rotate(${rotation}deg)`,
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.4), inset 0 0 10px rgba(0,0,0,0.5)',
          border: '5px solid var(--border-color)',
          background: 'var(--card-bg)'
        }}
      >
        {ROULETTE_OPTIONS.map((opt, i) => {
          const rotationAngle = i * (360 / ROULETTE_OPTIONS.length);
          const skewAngle = 90 - (360 / ROULETTE_OPTIONS.length);
          const color = i % 2 === 0 ? '#1a1a1a' : '#0a0a0a';
          const textColor = i === 0 ? 'var(--text-muted)' : 'var(--primary-cyan)';

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
                backgroundColor: color,
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `skewY(${skewAngle}deg) rotate(${360 / ROULETTE_OPTIONS.length / 2}deg) translate(-50%, -50%)`,
                textAlign: 'center',
                color: textColor,
                fontWeight: 'bold',
                fontSize: opt === 0 ? '0.8rem' : '1.2rem',
                minWidth: '60px'
              }}>
                {opt === 0 ? 'Vuelve\nMañana' : `${opt}\npts`}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        className="btn-primary" 
        onClick={spin} 
        disabled={spinning || disabled}
        style={{ marginTop: '2rem', padding: '15px 40px', fontSize: '1.2rem', letterSpacing: '2px', borderRadius: '30px' }}
      >
        {spinning ? 'GIRANDO...' : '¡GIRAR RULETA!'}
      </button>
    </div>
  );
}
