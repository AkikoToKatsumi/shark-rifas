import React from 'react';
import { CheckCircle, Clock, User, Phone, Calendar } from 'lucide-react';

interface DigitalTicketProps {
  participantName: string;
  participantPhone: string;
  raffleData: {
    raffleTitle: string;
    raffleImage: string;
    latestDate: string;
    allPaid: boolean;
    totalTickets: number;
    numbers: string[];
  };
}

export default function DigitalTicket({ participantName, participantPhone, raffleData }: DigitalTicketProps) {
  const { raffleTitle, raffleImage, latestDate, allPaid, numbers } = raffleData;
  const formattedDate = new Date(latestDate).toLocaleString('es-DO', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });

  const maskName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 3) + '***';
    const first = parts[0];
    const last = parts[1] || '';
    return `${first} ${last.substring(0, 1)}***`;
  };

  const maskPhoneOrCedula = (num: string) => {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned + '***';
    return cleaned.substring(0, 5) + '****';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #111827, #0f172a)',
      borderRadius: '20px',
      overflow: 'hidden',
      maxWidth: '850px',
      width: '100%',
      margin: '0 auto',
      boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(0, 242, 254, 0.15)',
      border: '1px solid rgba(0, 242, 254, 0.3)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexWrap: 'wrap', // Permite que se apile en móviles si es necesario
      alignItems: 'stretch'
    }}>
      
      {/* Left Column: Info */}
      <div style={{ 
        flex: '1 1 350px', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
            <img src="/logo.png" alt="SHARKRD" style={{ height: '50px', objectFit: 'contain' }} />
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3rem', fontWeight: '900', letterSpacing: '1px' }}>SHARKRD</h2>
              <p style={{ color: 'var(--primary-cyan)', margin: 0, fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>COMPROBANTE VIRTUAL</p>
            </div>
          </div>

          <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.4rem', lineHeight: '1.3' }}>
            {raffleTitle}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '1rem', fontWeight: '500' }}>
              <User size={18} color="var(--primary-cyan)" /> 
              <span>{maskName(participantName)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '1rem', fontWeight: '500' }}>
              <Phone size={18} color="var(--primary-cyan)" /> 
              <span style={{ letterSpacing: '2px' }}>{maskPhoneOrCedula(participantPhone)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <Calendar size={16} /> 
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '25px' }}>
          {allPaid ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '1rem' }}>
              <CheckCircle size={20} /> PAGO VERIFICADO
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', border: '1px solid rgba(249, 115, 22, 0.3)', fontSize: '1rem' }}>
              <Clock size={20} /> PENDIENTE CONCILIACIÓN
            </div>
          )}
        </div>
      </div>

      {/* Vertical Perforated Divider */}
      <div className="ticket-divider" style={{
        width: '4px',
        background: 'linear-gradient(to bottom, transparent, rgba(0, 242, 254, 0.5) 20%, rgba(0, 242, 254, 0.5) 80%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0'
      }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', margin: '0 -6px', zIndex: 2, borderRight: '1px solid rgba(0, 242, 254, 0.3)' }}></div>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', margin: '0 -6px', zIndex: 2, borderRight: '1px solid rgba(0, 242, 254, 0.3)' }}></div>
      </div>

      {/* Right Column: Numbers */}
      <div style={{ 
        flex: '1 1 350px', 
        background: '#fff', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Background image watermark */}
        {raffleImage && (
          <div style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundImage: `url(${raffleImage})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            opacity: 0.05,
            zIndex: 0
          }}></div>
        )}

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '900' }}>NÚMEROS ASIGNADOS</h4>
            <div style={{ background: 'linear-gradient(to right, var(--primary-cyan), var(--primary-blue))', color: '#000', padding: '6px 16px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 'bold' }}>
              {numbers.length} TOTAL
            </div>
          </div>

          <div className="numbers-grid" style={{ 
            flexGrow: 1,
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
            gap: '10px', 
            alignContent: 'start',
            maxHeight: '260px',
            overflowY: 'auto',
            paddingRight: '5px'
          }}>
            {numbers.map((num: string, idx: number) => (
              <span key={idx} style={{ 
                fontWeight: '900', 
                fontSize: '1.2rem',
                color: '#0f172a',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '8px 4px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                {num}
              </span>
            ))}
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1.5px' }}>
            COMPROBANTE PARA TRANSMISIÓN OFICIAL
          </div>
        </div>
      </div>

    </div>
  );
}
