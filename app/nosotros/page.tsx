export default function AboutPage() {
  return (
    <div className="about-container">
      <section className="about-section" id="nosotros">
        <div className="section-header">
          <h2>SOBRE NOSOTROS</h2>
          <div className="header-line"></div>
        </div>
        <div className="about-content">
          <div className="about-card">
            <h3>🦈 ¿Quiénes Somos?</h3>
            <p>Somos <strong>Shark RD Rifas</strong>, tu portal seguro para participar en las mejores rifas del país. Garantizamos sorteos en vivo y transparentes con entrega inmediata de premios.</p>
          </div>
          <div className="about-card">
            <h3>💳 Métodos de Pago</h3>
            <p className="mb-4">Realiza tus pagos de forma segura a través de nuestras cuentas oficiales:</p>
            
            <div className="payment-stack" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src="/banreservas.png" alt="Banreservas" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold' }}>Banco Reservas</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cuenta Corriente Personal</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src="/qik.png" alt="Qik" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold' }}>Qik Banco Digital</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pagos instantáneos</span>
                </div>
              </div>

{/* BHD temporalmente oculto */}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '1.5rem', width: '35px', textAlign: 'center' }}>🌐</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold' }}>PayPal</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pagos internacionales (USD)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(34, 197, 94, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <span style={{ fontSize: '1.5rem', width: '35px', textAlign: 'center' }}>💵</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#22c55e' }}>Pagos en Efectivo</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2', display: 'block' }}>
                    Puedes pagar en persona a través de nuestros colaboradores autorizados o contactarnos vía WhatsApp para coordinar.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0, 242, 254, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                <span style={{ fontSize: '1.5rem', width: '35px', textAlign: 'center' }}>🎡</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-cyan)' }}>Ruleta de Suerte</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2', display: 'block' }}>
                    Acumula puntos con tus giros diarios. Al alcanzar 500 puntos, puedes canjearlos por un boleto para cualquier rifa.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="about-card">
            <h3>📱 Redes y Soporte</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://www.instagram.com/rifassharkrd?igsh=MWszNzZsdDBxMzgzeA==" target="_blank" rel="noopener noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>
                <img src="/instagram-logo.png" alt="Instagram" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> @rifassharkrd
              </a>
              
              <a href="https://www.tiktok.com/@rifassharkrd" target="_blank" rel="noopener noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>
                <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>📱</span> TikTok @rifassharkrd
              </a>
              
              <a href="https://wa.me/18495789996" target="_blank" rel="noopener noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#25D366', padding: '10px 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span> WhatsApp Soporte
              </a>

              <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '5px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>CORREO ELECTRÓNICO:</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-cyan)' }}>adminsharkrd@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
