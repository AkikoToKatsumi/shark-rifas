'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User, RefreshCw, Eye, EyeOff, Key, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AuthView = 'login' | 'register' | 'forgot-request' | 'forgot-confirm';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login fields
  const [loginId, setLoginId] = useState(''); // Email, Phone or Cedula
  const [password, setPassword] = useState('');
  
  // Register fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cedula, setCedula] = useState('');

  // Reset fields
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailHint, setEmailHint] = useState('');
  
  const { refreshUser } = useAuth();

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      let endpoint = '';
      let body = {};

      if (view === 'login') {
        endpoint = '/api/auth/login';
        body = { loginId, password };
      } else if (view === 'register') {
        endpoint = '/api/auth/register';
        body = { fullName, phone, email, cedula, password };
      } else if (view === 'forgot-request') {
        endpoint = '/api/auth/reset-password/request';
        body = { loginId }; // Here loginId is whatever they entered to identify themselves
      } else if (view === 'forgot-confirm') {
        endpoint = '/api/auth/reset-password/confirm';
        body = { loginId, pin, newPassword };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error. Intenta nuevamente.');
      }

      if (view === 'forgot-request') {
        setSuccess(data.message);
        setEmailHint(data.email_hint || '');
        setView('forgot-confirm');
      } else if (view === 'forgot-confirm') {
        setSuccess('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
        setView('login');
      } else {
        // Login or Register success
        await refreshUser();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    switch(view) {
      case 'login': return { title: 'Iniciar Sesión', sub: 'Accede para ver tus puntos y recompensas.' };
      case 'register': return { title: 'Crear Cuenta', sub: 'Únete para ganar puntos diarios y canjear boletos gratis.' };
      case 'forgot-request': return { title: 'Recuperar Contraseña', sub: 'Ingresa tu identificación para recibir un código.' };
      case 'forgot-confirm': return { title: 'Verificar Código', sub: `Ingresa el código enviado a ${emailHint || 'tu correo'}.` };
    }
  };

  const { title, sub } = renderHeader();

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '2rem' }}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-cyan)' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{sub}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {(view === 'login' || view === 'forgot-request') && (
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Cédula, Teléfono o Correo" 
                required 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
          )}

          {view === 'register' && (
            <>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Nombre Completo" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="input-group">
                <Phone size={18} className="input-icon" />
                <input type="tel" placeholder="Teléfono" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="Correo Electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Cédula de Identidad" required value={cedula} onChange={(e) => setCedula(e.target.value)} />
              </div>
            </>
          )}

          {view === 'forgot-confirm' && (
            <>
              <div className="input-group">
                <Key size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Código PIN (6 dígitos)" 
                  required 
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>
              <div className="input-group">
                <Shield size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Nueva Contraseña" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {(view === 'login' || view === 'register') && (
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '45px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {view === 'login' && (
            <div style={{ textAlign: 'right' }}>
              <button 
                type="button" 
                onClick={() => { setView('forgot-request'); resetMessages(); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : (
              view === 'login' ? 'Ingresar' : 
              view === 'register' ? 'Registrarme' : 
              view === 'forgot-request' ? 'Enviar Código' : 'Restablecer Contraseña'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {view === 'login' ? (
            <>
              ¿No tienes cuenta?
              <button onClick={() => { setView('register'); resetMessages(); }} style={{ background: 'none', border: 'none', color: 'var(--primary-cyan)', fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer' }}>Regístrate</button>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?
              <button onClick={() => { setView('login'); resetMessages(); }} style={{ background: 'none', border: 'none', color: 'var(--primary-cyan)', fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer' }}>Inicia Sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
