'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User, RefreshCw, Eye, EyeOff, ShieldCheck, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen || !user) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al cambiar la contraseña');
      }

      setSuccess('¡Contraseña actualizada correctamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', padding: 0, overflow: 'hidden' }}>
        
        {/* Header Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
          padding: '2rem 1.5rem',
          position: 'relative',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <button 
            className="close-btn" 
            onClick={onClose} 
            style={{ top: '15px', right: '15px', color: 'rgba(255,255,255,0.5)' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(0, 242, 254, 0.1)', 
            border: '2px solid var(--primary-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'var(--primary-cyan)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)'
          }}>
            <User size={40} />
          </div>
          
          <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>{user.full_name}</h2>
          <p style={{ color: 'var(--primary-cyan)', fontSize: '0.9rem', margin: '5px 0 0', fontWeight: 'bold' }}>
            {user.points} PUNTOS ACUMULADOS
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          
          {!isChangingPassword ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-muted)' }}><Mail size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correo Electrónico</div>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>{user.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-muted)' }}><Fingerprint size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cédula de Identidad</div>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>{user.cedula || 'No registrada'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-muted)' }}><Phone size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Teléfono</div>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>{user.phone}</div>
                </div>
              </div>

              <button 
                onClick={() => setIsChangingPassword(true)}
                style={{ 
                  marginTop: '1rem',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-cyan)';
                  e.currentTarget.style.color = 'var(--primary-cyan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <Lock size={16} /> Cambiar Contraseña
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-cyan)', marginBottom: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsChangingPassword(false); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-cyan)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  ← VOLVER
                </button>
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  {success}
                </div>
              )}

              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showCurrentPass ? "text" : "password"} 
                  placeholder="Contraseña Actual" 
                  required 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="inner-input-btn">
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="input-group">
                <ShieldCheck size={18} className="input-icon" />
                <input 
                  type={showNewPass ? "text" : "password"} 
                  placeholder="Nueva Contraseña" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="inner-input-btn">
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="input-group">
                <ShieldCheck size={18} className="input-icon" />
                <input 
                  type={showNewPass ? "text" : "password"} 
                  placeholder="Confirmar Nueva Contraseña" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>

        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
          Shark RD Rifas © {new Date().getFullYear()}
        </div>
      </div>
      
      <style jsx>{`
        .inner-input-btn {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
        }
        .inner-input-btn:hover {
          color: var(--primary-cyan);
        }
      `}</style>
    </div>
  );
}
