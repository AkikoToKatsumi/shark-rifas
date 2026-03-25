'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Duration of the animation (match with CSS progressRun 2.5s)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    // Completely remove from DOM after fade out transition (0.8s)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 3600);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      <img src="/logo.png" alt="Shark RD" className="splash-logo" />
      <div className="loading-bar-container">
        <div className="loading-bar-fill"></div>
      </div>
    </div>
  );
}
