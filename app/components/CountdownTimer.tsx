'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="countdown-container">
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.days}</span>
        <span className="countdown-label">Días</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.hours}</span>
        <span className="countdown-label">Hrs</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.minutes}</span>
        <span className="countdown-label">Min</span>
      </div>
    </div>
  );
}
