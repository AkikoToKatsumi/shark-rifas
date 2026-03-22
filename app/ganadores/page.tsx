'use client';

import { Trophy, Clock } from 'lucide-react';

export default function GanadoresPage() {
  return (
    <div className="winners-container text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="section-header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
        <h2 className="text-3xl">🏆 GALERÍA DE GANADORES</h2>
      </div>
      
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed rgba(0, 242, 254, 0.3)',
        borderRadius: '16px',
        padding: '3rem 2rem',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          background: 'rgba(0, 242, 254, 0.1)', 
          padding: '20px', 
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--primary-cyan)'
        }}>
          <Clock size={48} />
        </div>
        
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>
          AÚN NO TENEMOS GANADORES DISPONIBLES
        </h3>
        
        <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
          ESTAMOS PREPARANDO TODO. CUANDO EFECTUEMOS NUESTRA PRIMERA RIFA, LES DAREMOS A CONOCER LOS AGRACIADOS POR ESTE MEDIO.
        </p>
      </div>
      
      <div className="mt-12 mb-12">
         <button 
           className="btn-accent" 
           style={{ padding: '15px 30px', fontSize: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
           onClick={() => window.location.href = '/'}
         >
            <Trophy size={18} /> ¡QUIERO PARTICIPAR EN LA PRÓXIMA RIFA!
         </button>
      </div>
    </div>
  );
}
