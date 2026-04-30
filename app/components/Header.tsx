'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Target, Search, Trophy, Info, User, Gift, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

export default function Header() {
  const pathname = usePathname();
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="header-container position-relative">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      
      <div className="floating-controls">
        {/* User Account / Profile */}
        {user ? (
          <div className="user-badge">
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="user-info-btn"
              title="Mi Perfil"
            >
              <span className="block text-white bold text-sm">{user.full_name.split(' ')[0]}</span>
              <span className="primary-cyan text-xs flex items-center gap-3">
                <Gift size={12} /> {user.points} pts
              </span>
            </button>
            <div className="divider-v"></div>
            <button 
              onClick={logout}
              className="btn-logout"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="auth-btn"
          >
            <LogIn size={16} /> MI CUENTA
          </button>
        )}

        {/* Admin Icon */}
        <button 
          onClick={() => setIsAdminDrawerOpen(true)}
          className="admin-trigger"
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
      
      <div className="logo-section-container">
        <img 
          src="/logo.png" 
          alt="Shark RD Logo" 
          className="logo-img-header" 
        />
        <div className="logo-text-center">
          <h1 className="logo-title-responsive">SHARK RD RIFAS</h1>
          <p className="subtitle logo-subtitle-responsive">SISTEMA DE RIFAS VIRTUALES</p>
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
