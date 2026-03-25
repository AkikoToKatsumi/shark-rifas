import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

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
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  });

  return (
    <div style={{
      background: 'var(--bg-panel)',
      borderRadius: '20px',
      overflow: 'hidden',
      maxWidth: '450px',
      margin: '0 auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0, 242, 254, 0.2)',
      border: '1px solid rgba(255,255,255,0.05)',
      fontFamily: 'monospace'
    }}>
      {/* Ticket Header (Logo and Image) */}
      <div style={{ background: '#000', padding: '15px', textAlign: 'center', position: 'relative' }}>
        <img src="/logo.png" alt="Shark RD" style={{ height: '50px', objectFit: 'contain', marginBottom: '10px' }} />
        <h2 style={{ background: '#fff', color: '#000', padding: '10px', margin: 0, textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>
          SHARK RD RIFAS
        </h2>
      </div>

      {/* Hero Section */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        {raffleImage ? (
          <img src={raffleImage} alt={raffleTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)' }}></div>
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.9))' }}></div>
        
        <div style={{ position: 'absolute', bottom: '15px', left: '20px', right: '20px', zIndex: 2 }}>
          <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1.3rem', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            {raffleTitle}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {allPaid ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontWeight: 'bold' }}>
                <CheckCircle size={16} /> Pago Verificado
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>
                <Clock size={16} /> Pendiente de Verificación
              </div>
            )}
            <div style={{ color: '#fff', fontSize: '0.9rem' }}>👤 {participantName}</div>
            <div style={{ color: '#fff', fontSize: '0.9rem' }}>📱 {participantPhone}</div>
            <div style={{ color: '#ccc', fontSize: '0.8rem' }}>📅 {formattedDate}</div>
          </div>
        </div>
      </div>

      {/* Perforated Divider */}
      <div style={{ 
        height: '24px', 
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' fill=\'none\'%3E%3Cpath fill=\'%23050a10\' d=\'M0 12A12 12 0 1 1 24 12A12 12 0 1 1 0 12Z\'/%3E%3C/svg%3E") repeat-x center',
        margin: '-12px 0',
        position: 'relative',
        zIndex: 3
      }}></div>

      {/* Ticket Numbers Section */}
      <div style={{ backgroundColor: '#fff', color: '#000', padding: '30px 20px', marginTop: '10px' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', fontSize: '1rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          TUS NÚMEROS DE LA SUERTE
        </h4>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          justifyContent: 'center',
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '5px'
        }}>
          {numbers.map((num: string, idx: number) => (
            <span key={idx} style={{ 
              fontWeight: 'bold', 
              fontSize: '1.2rem',
              background: '#f8f9fa',
              border: '1px solid #ddd',
              padding: '4px 10px',
              borderRadius: '6px',
              letterSpacing: '1px'
            }}>
              {num}
            </span>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#888' }}>
          TOTAL BOLETOS: <strong>{numbers.length}</strong>
        </div>
      </div>
    </div>
  );
}
