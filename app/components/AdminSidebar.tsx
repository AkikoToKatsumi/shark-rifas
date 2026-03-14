'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('shark_admin_auth');
    setIsAuthenticated(auth === 'true');
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        localStorage.setItem('shark_admin_auth', 'true');
        localStorage.setItem('shark_admin_key', password);
        setIsAuthenticated(true);
        onClose();
        router.push('/admin');
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shark_admin_auth');
    localStorage.removeItem('shark_admin_key');
    setIsAuthenticated(false);
    onClose();
    router.push('/');
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      <div className={`admin-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`admin-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>🔒 ADMIN ACCESS</h2>
          <button className="close-drawer" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          {isAuthenticated ? (
            <div className="logged-in-view">
              <p className="text-cyan mb-4" style={{ fontWeight: 'bold' }}>Sessión Iniciada</p>
              <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>
                Tienes acceso total al panel de administración.
              </p>
              
              <button 
                onClick={() => { onClose(); router.push('/admin'); }}
                className="btn-primary w-full mb-4"
              >
                IR AL PANEL DE CONTROL
              </button>

              <button 
                onClick={handleLogout}
                className="w-full"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  padding: '12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                CERRAR SESIÓN
              </button>
            </div>
          ) : (
            <>
              <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>
                Ingresa la contraseña maestra para acceder al panel de administración de Shark Rifas.
              </p>

              <form onSubmit={handleLogin} className="login-form-drawer">
                <div className="form-group">
                  <label>Contraseña Maestra</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus={isOpen}
                  />
                </div>
                
                {error && <p className="text-error mb-4" style={{ fontSize: '0.85rem' }}>{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'VERIFICANDO...' : 'INGRESAR AL PANEL'}
                </button>
              </form>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center' }}>
            <img src="/logo.png" alt="Shark Logo" style={{ width: '80px', opacity: 0.2 }} />
          </div>
        </div>
      </div>
    </>
  );
}
