import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <img src="/logo.png" alt="Shark RD Logo" style={{ height: '80px', objectFit: 'contain', marginBottom: '15px' }} />
            <h2 className="footer-logo">SHARK RD <span>RIFAS</span></h2>
            <p className="footer-slogan">Tu plataforma de confianza para ganar grandes premios. Rifas 100% virtuales, transparentes y seguras en toda la República Dominicana.</p>
            <div className="social-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <a href="https://www.instagram.com/rifassharkrd?igsh=MWszNzZsdDBxMzgzeA==" target="_blank" rel="noopener noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-cyan)', fontWeight: 'bold', fontSize: '1rem' }}>
                <img src="/instagram-logo.png" alt="Instagram" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> @rifassharkrd
              </a>
              <a href="https://wa.me/18495789996" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-icon" 
                 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                <span>💬</span> Soporte WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links">
            <h3>ENLACES RÁPIDOS</h3>
            <ul>
              <li><Link href="/">🎯 Rifas Activas</Link></li>
              <li><Link href="/verificador">🔍 Verificar Boleto</Link></li>
              <li><Link href="/ganadores">🏆 Ganadores</Link></li>
              <li><Link href="/nosotros">🦈 Sobre Nosotros</Link></li>
            </ul>
          </div>

          {/* Contact / Help Column */}
          <div className="footer-contact">
            <h3>ATENCIÓN AL CLIENTE</h3>
            <ul>
              <li><span>📍</span> La Vega, RD</li>
              <li><span>📞</span> +1 (849) 578-9996</li>
              <li><span>✉️</span> adminsharkrd@gmail.com</li>
              <li className="work-hours">Lun - Sab: 8:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Shark RD Rifas. Todos los derechos reservados.</p>
          <div className="footer-badges">
            <span className="badge">100% SEGURO 🔒</span>
            <span className="badge">PAGOS VERIFICADOS ✓</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
