'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Target, Search, Trophy, Info, User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  return (
    <header className="header-container position-relative">
      <button 
        onClick={() => setIsAdminDrawerOpen(true)}
        style={{ 
          position: 'fixed', 
          top: '15px', 
          right: '15px', 
          width: '45px',
          height: '45px',
          backgroundColor: 'rgba(5, 10, 16, 0.8)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--primary-cyan)',
          border: '1px solid var(--primary-cyan)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          fontSize: '1.2rem',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 242, 254, 0.1)';
          e.currentTarget.style.borderColor = 'var(--primary-cyan)';
          e.currentTarget.style.color = 'var(--primary-cyan)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
        title="Admin Login"
      >
        <User size={20} />
      </button>

      {/* Admin Sidebar / Drawer */}
      <AdminSidebar 
        isOpen={isAdminDrawerOpen} 
        onClose={() => setIsAdminDrawerOpen(false)} 
      />
      <div className="top-marquee">
        <div className="marquee-content">
          <span>📢 ¡MANTENTE ATENTO A NUESTROS PRÓXIMOS SORTEOS!</span>
          <span>🚀 ¡TU SUERTE PUEDE CAMBIAR HOY MISMO CON SHARK RD!</span>
          <span>🎯 RIFAS 100% VIRTUALES, TRANSPARENTES Y SEGURAS</span>
          <span>✨ ¡PARTICIPA Y CONVIÉRTETE EN NUESTRO PRÓXIMO GANADOR!</span>
          <span>🏆 ÚNETE A NUESTRA COMUNIDAD DE GANADORES</span>
        </div>
      </div>
      
      <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '2rem 1rem' }}>
        <img 
          src="/logo.png" 
          alt="Shark RD Logo" 
          className="logo-img" 
          style={{ 
            width: '100%', 
            maxWidth: '350px', 
            height: 'auto', 
            maxHeight: '200px',
            objectFit: 'contain', 
            marginBottom: '1rem' 
          }} 
        />
        <div className="logo-text" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', margin: 0 }}>SHARK RD RIFAS</h1>
          <p className="subtitle" style={{ fontSize: 'clamp(0.7rem, 3vw, 0.9rem)', letterSpacing: '4px' }}>SISTEMA DE RIFAS VIRTUALES</p>
        </div>
      </div>

      <nav className="main-nav">
        <ul>
          <li>
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              <Target size={18} className="nav-icon" /> RIFAS ACTIVAS
            </Link>
          </li>
          <li>
            <Link href="/verificador" className={`nav-link ${pathname === '/verificador' ? 'active' : ''}`}>
              <Search size={18} className="nav-icon" /> VERIFICAR BOLETOS
            </Link>
          </li>
          <li>
            <Link href="/ganadores" className={`nav-link ${pathname === '/ganadores' ? 'active' : ''}`}>
              <Trophy size={18} className="nav-icon" /> GANADORES
            </Link>
          </li>

          <li>
            <Link href="/nosotros" className={`nav-link ${pathname === '/nosotros' ? 'active' : ''}`}>
              <Info size={18} className="nav-icon" /> SOBRE NOSOTROS
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
