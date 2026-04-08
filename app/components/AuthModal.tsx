'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login fields
  const [loginId, setLoginId] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  
  // Register fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cedula, setCedula] = useState('');
  
  const { refreshUser } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { loginId, password }
        : { fullName, phone, email, cedula, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error. Intenta nuevamente.');
      }

      await refreshUser();
      onClose(); // Cerrar modal al tener éxito
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '2rem' }}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-cyan)' }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin 
              ? 'Accede para ver tus puntos y recompensas.' 
              : 'Únete para ganar puntos diarios y canjear boletos gratis.'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {isLogin ? (
            <>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Correo o Teléfono" 
                  required 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Nombre Completo" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <Phone size={18} className="input-icon" />
                <input 
                  type="tel" 
                  placeholder="Teléfono (ej: 8091234567)" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Correo Electrónico" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Cédula de Identidad" 
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : (isLogin ? 'Ingresar' : 'Registrarme')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary-cyan)', fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer' }}
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
