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
            <h3>🔒 Compra Segura</h3>
            <p>Nuestro sistema te da confirmación inmediata vía WhatsApp y correo tras la validación de tu pago. Operamos con políticas estrictas contra el fraude.</p>
          </div>
          <div className="about-card">
            <h3>💳 Métodos de Pago</h3>
            <p>Puedes pagar todos tus boletos fácil y rápido usando las plataformas de pago preferidas del país.</p>
            <div className="payment-badges" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px', fontSize: '13px' }}>🌐 PayPal</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px', fontSize: '13px' }}>🏦 B. Reservas</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px', fontSize: '13px' }}>⚡ QIK</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
