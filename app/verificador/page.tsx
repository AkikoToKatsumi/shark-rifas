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
    <div className="home-container verify-container flex-center">
      <section className="raffles-section w-full max-w-800 m-auto">
        <div className="section-header flex-center">
          <h2>VERIFICA TU BOLETO</h2>
        </div>

        <div className="glass-panel">
          {!user ? (
            <form onSubmit={handleVerify} className="flex-col gap-10">
              <label className="text-muted text-center" style={{ fontSize: '0.9rem', display: 'block' }}>
                Ingresa el <strong>Código Secreto de Verificación</strong> que recibiste a tu correo o tu <strong>Número de Teléfono</strong>.
              </label>
              <div className="flex-col gap-15 flex-center mt-10">
                <input 
                  type="text" 
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value.toUpperCase())}
                  placeholder="EJ. SHK-0101 O #TELÉFONO"
                  className="verify-input max-w-400"
                  required
                />
                <button type="submit" className="btn-accent verify-button w-full max-w-300" disabled={verifyLoading}>
                  {verifyLoading ? 'BUSCANDO...' : '🔍 BUSCAR'}
                </button>
              </div>
              {verifyError && <p className="text-center mt-10" style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{verifyError}</p>}
            </form>
          ) : (
            <div className="text-center mb-10">
              <h3 className="primary-cyan mb-10" style={{ color: 'var(--primary-cyan)' }}>Tus Boletos Registrados</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Mostrando los boletos asociados a tu cuenta ({user.phone}).</p>
              {verifyLoading && <p className="mt-10" style={{ color: 'var(--accent-orange)' }}>Cargando tus boletos...</p>}
            </div>
          )}

          {verifyResult && (
            <div className="mt-20 border-top-faint">
              <div className="mb-10">
                <h3 className="verify-result-header">
                  <span style={{ fontSize: '1.5rem' }}>👤</span> {verifyResult.participantName}
                </h3>
                {verifyResult.participantEmail && (
                  <p className="verify-result-email">
                    ✉️ {verifyResult.participantEmail}
                  </p>
                )}
              </div>
              
              {verifyResult.tickets.length === 0 ? (
                <p className="text-muted">No tienes boletos registrados.</p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {verifyResult.tickets.map((t, i) => (
                    <div key={i} className={`ticket-item ${t.status === 'paid' ? 'status-paid' : t.status === 'pending' ? 'status-pending' : 'status-cancelled'}`}>
                      <div>
                        <div className="ticket-number">{t.ticket_number}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t.raffles?.title || 'Rifa General'}</div>
                      </div>
                      <div className="text-right" style={{ textAlign: 'right' }}>
                        <span className={`ticket-status-badge ${t.status === 'paid' ? 'status-paid' : t.status === 'pending' ? 'status-pending' : 'status-cancelled'}`}>
                          {t.status === 'paid' ? 'PAGADO ✓' : t.status === 'pending' ? 'PENDIENTE ⏳' : 'CANCELADO ❌'}
                        </span>
                        <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '4px', textTransform: 'uppercase' }}>{t.payment_method}</div>
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
