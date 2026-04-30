'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
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
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        localStorage.setItem('shark_admin_auth', 'true');
        localStorage.setItem('shark_admin_user', username);
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
    localStorage.removeItem('shark_admin_user');
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
          <h2 className="flex items-center gap-2"><Lock size={20} /> ACCESO ADMIN</h2>
          <button className="close-drawer" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          {isAuthenticated ? (
            <div className="logged-in-view">
              <p className="text-cyan mb-4 bold">Sessión Iniciada</p>
              <p className="text-muted mb-6 text-sm">
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
                className="btn-logout-drawer"
              >
                CERRAR SESIÓN
              </button>
            </div>
          ) : (
            <>
              <p className="text-muted mb-6 text-sm">
                Ingresa tus credenciales para acceder al panel de administración.
              </p>

              <form onSubmit={handleLogin} className="login-form-drawer">
                <div className="form-group">
                  <label>Usuario</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                    autoFocus={isOpen}
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {error && <p className="text-error mb-4 text-xs-plus">{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'VERIFICANDO...' : 'INGRESAR AL PANEL'}
                </button>
              </form>
            </>
          )}

          <div className="drawer-footer-brand">
            <img src="/logo.png" alt="Shark Logo" className="footer-mini-logo" />
          </div>
        </div>
      </div>
    </>
  );
}
