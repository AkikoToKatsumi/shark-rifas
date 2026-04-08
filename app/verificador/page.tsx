'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VerificadorPage() {
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ participantName: string, participantEmail?: string, tickets: any[] } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.phone) {
      setVerifyQuery(user.phone);
      autoVerify(user.phone);
    }
  }, [user]);

  const autoVerify = async (query: string) => {
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al verificar');
      setVerifyResult(data);
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;
    autoVerify(verifyQuery);
  };

  return (
    <div className="home-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section className="raffles-section" style={{ width: '100%', maxWidth: '800px', margin: '2rem auto' }}>
        <div className="section-header" style={{ justifyContent: 'center' }}>
          <h2>VERIFICA TU BOLETO</h2>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {!user ? (
            <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block' }}>
                Ingresa el <strong>Código Secreto de Verificación</strong> que recibiste a tu correo o tu <strong>Número de Teléfono</strong>.
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                <input 
                  type="text" 
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value.toUpperCase())}
                  placeholder="EJ. SHK-0101 O #TELÉFONO"
                  style={{ 
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.4rem', 
                    padding: '15px', 
                    width: '100%',
                    maxWidth: '400px', 
                    letterSpacing: '2px', 
                    textAlign: 'center',
                    color: '#000',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    border: '2px solid var(--primary-cyan)'
                  }}
                  required
                />
                <button type="submit" className="btn-accent" disabled={verifyLoading} style={{ 
                  padding: '15px 40px', 
                  fontSize: '1.2rem', 
                  borderRadius: '30px', 
                  minWidth: '250px',
                  width: '100%',
                  maxWidth: '300px',
                  letterSpacing: '1px',
                  boxShadow: '0 4px 15px rgba(255, 140, 0, 0.4)'
                }}>
                  {verifyLoading ? 'BUSCANDO...' : '🔍 BUSCAR'}
                </button>
              </div>
              {verifyError && <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '10px', textAlign: 'center' }}>{verifyError}</p>}
            </form>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--primary-cyan)', marginBottom: '0.5rem' }}>Tus Boletos Registrados</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Mostrando los boletos asociados a tu cuenta ({user.phone}).</p>
              {verifyLoading && <p style={{ marginTop: '10px', color: 'var(--accent-orange)' }}>Cargando tus boletos...</p>}
            </div>
          )}

          {verifyResult && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '1.5rem' }}>👤</span> {verifyResult.participantName}
                </h3>
                {verifyResult.participantEmail && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '38px', letterSpacing: '0.5px' }}>
                    ✉️ {verifyResult.participantEmail}
                  </p>
                )}
              </div>
              
              {verifyResult.tickets.length === 0 ? (
                <p className="text-muted">No tienes boletos registrados.</p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {verifyResult.tickets.map((t, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '12px 15px', 
                      borderRadius: '6px',
                      borderLeft: t.status === 'paid' ? '4px solid var(--success)' : '4px solid var(--accent-orange)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', letterSpacing: '2px' }}>{t.ticket_number}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.raffles?.title || 'Rifa General'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          backgroundColor: t.status === 'paid' ? 'rgba(0, 255, 136, 0.1)' : t.status === 'pending' ? 'rgba(255, 140, 0, 0.1)' : 'rgba(255, 60, 172, 0.1)',
                          color: t.status === 'paid' ? 'var(--success)' : t.status === 'pending' ? 'var(--accent-orange)' : 'var(--error)',
                          textTransform: 'uppercase'
                        }}>
                          {t.status === 'paid' ? 'PAGADO ✓' : t.status === 'pending' ? 'PENDIENTE ⏳' : 'CANCELADO ❌'}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>{t.payment_method}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
