'use client';

import { useState } from 'react';
import DigitalTicket from '../components/DigitalTicket';

export default function VerificadorPage() {
  const [searchMode, setSearchMode] = useState<'code' | 'participant'>('participant');
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyResult(null);
    if (!verifyQuery.trim()) return;

    setVerifyLoading(true);
    try {
      const endpoint = searchMode === 'code' ? '/api/verify' : '/api/verify-participant';
      const payloadQuery = searchMode === 'code' ? verifyQuery.toUpperCase() : verifyQuery;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: payloadQuery })
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

  return (
    <div className="home-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section className="raffles-section" style={{ width: '100%', maxWidth: '800px', margin: '2rem auto' }}>
        <div className="section-header">
          <h2>VERIFICA TU BOLETO</h2>
          <div className="header-line"></div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            <button 
              onClick={() => { setSearchMode('participant'); setVerifyResult(null); setVerifyError(''); }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: searchMode === 'participant' ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.05)',
                color: searchMode === 'participant' ? '#000' : 'var(--text-muted)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ☎️ TELÉFONO / CÉDULA
            </button>
            <button 
              onClick={() => { setSearchMode('code'); setVerifyResult(null); setVerifyError(''); }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: searchMode === 'code' ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.05)',
                color: searchMode === 'code' ? '#000' : 'var(--text-muted)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🔑 CÓDIGO
            </button>
          </div>

          <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {searchMode === 'participant' 
                ? 'Ingresa tu Número de Teléfono o Cédula para ver todos tus boletos.'
                : 'Ingresa el Código Secreto de Verificación que recibiste en tu compra.'}
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input 
                type="text" 
                value={verifyQuery}
                onChange={(e) => setVerifyQuery(searchMode === 'code' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={searchMode === 'participant' ? "Ej. 8090000000 o 40200000000" : "Ej. SHK-A1B2C3"}
                className="ticket-input flex-grow"
                style={{ fontSize: '1.2rem', padding: '12px', minWidth: '200px', maxWidth: '400px', letterSpacing: searchMode === 'code' ? '2px' : '1px', textAlign: 'center' }}
                required
              />
              <button type="submit" className="btn-accent" disabled={verifyLoading} style={{ padding: '0 25px', minWidth: '150px' }}>
                {verifyLoading ? 'BUSCANDO...' : '🔍 BUSCAR'}
              </button>
            </div>
            {verifyError && <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '10px', textAlign: 'center' }}>{verifyError}</p>}
          </form>

          {verifyResult && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
              
              {searchMode === 'participant' ? (
                // Digital Ticket View (Participant Search)
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {verifyResult.raffles?.length === 0 ? (
                    <p className="text-muted text-center" style={{ fontSize: '1.1rem' }}>No tienes boletos registrados activamente.</p>
                  ) : (
                    verifyResult.raffles?.map((raffle: any, idx: number) => (
                      <DigitalTicket 
                        key={idx}
                        participantName={verifyResult.participantName}
                        participantPhone={verifyResult.participantPhone}
                        raffleData={raffle}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Legacy Code Search View
                <>
                  <h3 style={{ color: 'var(--primary-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span> {verifyResult.participantName}
                  </h3>
                  
                  {verifyResult.tickets?.length === 0 ? (
                    <p className="text-muted">No tienes boletos registrados.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {verifyResult.tickets?.map((t: any, i: number) => (
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
                              backgroundColor: t.status === 'paid' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 60, 172, 0.1)',
                              color: t.status === 'paid' ? 'var(--success)' : 'var(--accent-orange)',
                              textTransform: 'uppercase'
                            }}>
                              {t.status === 'paid' ? 'PAGADO ✓' : t.status}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>{t.payment_method}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
