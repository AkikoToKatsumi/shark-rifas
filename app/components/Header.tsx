'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Target, Search, Trophy, Info, User, Gift, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const pathname = usePathname();
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="header-container position-relative">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <div style={{ position: 'fixed', top: '15px', right: '15px', zIndex: 1000, display: 'flex', gap: '10px', alignItems: 'center' }}>
        
        {/* User Account / Profile */}
        {user ? (
          <div style={{ 
            backgroundColor: 'rgba(5, 10, 16, 0.8)', 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--primary-cyan)',
            borderRadius: '30px',
            padding: '6px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
              <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{user.full_name.split(' ')[0]}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Gift size={12} /> {user.points} pts
              </span>
            </div>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
            <button 
              onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
              title="Cerrar Sesión"
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            style={{ 
              backgroundColor: 'rgba(5, 10, 16, 0.8)', 
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid var(--primary-cyan)',
              borderRadius: '30px',
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-cyan)';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(5, 10, 16, 0.8)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <LogIn size={16} /> MI CUENTA
          </button>
        )}

        {/* Admin Icon */}
        <button 
          onClick={() => setIsAdminDrawerOpen(true)}
          style={{ 
            width: '38px',
            height: '38px',
            backgroundColor: 'rgba(5, 10, 16, 0.5)', 
            backdropFilter: 'blur(10px)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(5, 10, 16, 0.5)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title="Admin Panel"
        >
          <User size={16} />
        </button>
      </div>

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
          <li>
            <Link href="/recompensas" className={`nav-link ${pathname === '/recompensas' ? 'active' : ''}`} style={{ color: 'var(--primary-cyan)' }}>
              <Gift size={18} className="nav-icon" /> RECOMPENSAS DIARIAS
            </Link>
          </li>
          
        </ul>
      </nav>
    </header>
  );
}
