'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';

export default function Header() {
  const pathname = usePathname();
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  return (
    <header className="header-container position-relative">
      <button 
        onClick={() => setIsAdminDrawerOpen(true)}
        style={{ 
          position: 'fixed', 
          top: '50%', 
          right: '0', 
          transform: 'translateY(-50%)',
          width: '30px',
          height: '60px',
          backgroundColor: 'rgba(11, 19, 30, 0.8)', 
          color: 'var(--primary-cyan)',
          border: '1px solid var(--border-color)',
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'all 0.3s ease',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.width = '40px';
          e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.width = '30px';
          e.currentTarget.style.backgroundColor = 'rgba(11, 19, 30, 0.8)';
        }}
        title="Admin Login"
      >
        <span style={{ fontSize: '10px' }}>◀</span>
        <span style={{ fontSize: '16px' }}>👤</span>
      </button>

      {/* Admin Sidebar / Drawer */}
      <AdminSidebar 
        isOpen={isAdminDrawerOpen} 
        onClose={() => setIsAdminDrawerOpen(false)} 
      />
      <div className="top-marquee">
        <div className="marquee-content">
          <span>⚡ SORTEOS EN VIVO TODOS LOS FINES DE SEMANA</span>
          <span>🏆 MÁS DE 50 GANADORES ESTE MES</span>
          <span>🎯 ¡PARTICIPA Y GANA! SHARK RD - RIFAS 100% VIRTUALES Y SEGURAS</span>
          <span>⚡ SORTEOS EN VIVO TODOS LOS FINES DE SEMANA</span>
          <span>🏆 MÁS DE 50 GANADORES ESTE MES</span>
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
            <Link href="/" className="nav-link active">
              <span className="nav-icon">🎯</span> RIFAS ACTIVAS
            </Link>
          </li>
          <li>
            <Link href="/verificador" className={`nav-link ${pathname === '/verificador' ? 'active' : ''}`}>
              <span className="nav-icon">🔍</span> VERIFICAR BOLETOS
            </Link>
          </li>
          <li>
            <Link href="/ganadores" className={`nav-link ${pathname === '/ganadores' ? 'active' : ''}`}>
              <span className="nav-icon">🏆</span> GANADORES
            </Link>
          </li>

          <li>
            <Link href="/nosotros" className={`nav-link ${pathname === '/nosotros' ? 'active' : ''}`}>
              <span className="nav-icon">🦈</span> SOBRE NOSOTROS
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
