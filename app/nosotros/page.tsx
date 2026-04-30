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
            
            <div className="list-stack">
              <div className="list-item-glass">
                <img src="/banreservas.png" alt="Banreservas" className="img-icon-35" />
                <div>
                  <span className="block text-sm bold">Banco Reservas</span>
                  <span className="text-xs text-muted">Cuenta Corriente Personal</span>
                </div>
              </div>

              <div className="list-item-glass">
                <img src="/qik.png" alt="Qik" className="img-icon-35" />
                <div>
                  <span className="block text-sm bold">Qik Banco Digital</span>
                  <span className="text-xs text-muted">Pagos instantáneos</span>
                </div>
              </div>

{/* BHD temporalmente oculto */}

              <div className="list-item-glass">
                <span className="text-lg w-full text-center" style={{ width: '35px' }}>🌐</span>
                <div>
                  <span className="block text-sm bold">PayPal</span>
                  <span className="text-xs text-muted">Pagos internacionales (USD)</span>
                </div>
              </div>

              <div className="list-item-glass list-item-success">
                <span className="text-lg w-full text-center" style={{ width: '35px' }}>💵</span>
                <div>
                  <span className="block text-sm bold" style={{ color: '#22c55e' }}>Pagos en Efectivo</span>
                  <span className="text-xs text-muted block" style={{ lineHeight: '1.2' }}>
                    Puedes pagar en persona a través de nuestros colaboradores autorizados o contactarnos vía WhatsApp para coordinar.
                  </span>
                </div>
              </div>

              <div className="list-item-glass list-item-cyan">
                <span className="text-lg w-full text-center" style={{ width: '35px' }}>🎡</span>
                <div>
                  <span className="block text-sm bold" style={{ color: 'var(--primary-cyan)' }}>Ruleta de Suerte</span>
                  <span className="text-xs text-muted block" style={{ lineHeight: '1.2' }}>
                    Acumula puntos con tus giros diarios. Al alcanzar 500 puntos, puedes canjearlos por un boleto para cualquier rifa.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="about-card">
            <h3>📱 Redes y Soporte</h3>
            <div className="flex-col gap-10">
              <a href="https://www.instagram.com/rifassharkrd?igsh=MWszNzZsdDBxMzgzeA==" target="_blank" rel="noopener noreferrer" 
                 className="social-btn">
                <img src="/instagram-logo.png" alt="Instagram" className="img-icon-24" /> @rifassharkrd
              </a>
              
              <a href="https://www.tiktok.com/@rifassharkrd" target="_blank" rel="noopener noreferrer" 
                 className="social-btn">
                <span className="text-lg w-full text-center" style={{ width: '24px' }}>📱</span> TikTok @rifassharkrd
              </a>
              
              <a href="https://wa.me/18495789996" target="_blank" rel="noopener noreferrer" 
                 className="social-btn social-btn-whatsapp">
                <span className="text-lg">💬</span> WhatsApp Soporte
              </a>

              <div className="border-top-faint mt-10" style={{ padding: '10px' }}>
                <p className="text-xs text-muted" style={{ margin: 0 }}>CORREO ELECTRÓNICO:</p>
                <p className="bold primary-cyan" style={{ margin: 0, color: 'var(--primary-cyan)' }}>adminsharkrd@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
