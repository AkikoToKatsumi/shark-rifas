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
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'all 0.2s ease',
          fontSize: '1.2rem'
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
      
      <div className="logo-section" style={{ alignItems: 'center' }}>
        <img src="/logo.png" alt="Shark RD Logo" className="logo-img" style={{ height: '180px', objectFit: 'contain', marginBottom: '10px' }} />
        <div className="logo-text">
          <h1>SHARK RD RIFAS</h1>
          <p className="subtitle">SISTEMA DE RIFAS VIRTUALES</p>
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
