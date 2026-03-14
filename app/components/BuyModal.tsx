'use client';
import { useState } from 'react';

export default function BuyModal({ raffle, onClose }: { raffle: any, onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', cedula: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [assignedTickets, setAssignedTickets] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  // Ticket management functions removed - now automated by backend

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName || !formData.phone || !formData.email || !formData.cedula) {
      setErrorMsg("Por favor completa todos tus datos personales incluyendo tu cédula.");
      return;
    }
    if (quantity < 1) {
      setErrorMsg("La cantidad mínima es 1 boleto.");
      return;
    }
    if (!paymentMethod) {
      setErrorMsg("Seleccione un método de pago.");
      return;
    }
    if (!receiptFile) {
      setErrorMsg("Debes subir tu comprobante de pago para confirmar la compra.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert file to base64
      const buffer = await receiptFile.arrayBuffer();
      const base64String = Buffer.from(buffer).toString('base64');
      const mimeType = receiptFile.type;
      const receiptDataUrl = `data:${mimeType};base64,${base64String}`;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raffleId: raffle.id,
          quantity,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          cedula: formData.cedula,
          paymentMethod,
          price: raffle.price,
          raffleTitle: raffle.title,
          receiptImage: receiptDataUrl
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la reserva. Por favor intenta de nuevo.');
      }

      setAssignedTickets(data.assignedTickets || []);
      setVerificationCode(data.verificationCode || '');
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al procesar la reserva. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-content text-center">
          <button className="modal-close" onClick={onClose}>×</button>
          <div className="success-icon">✅</div>
          <h2>¡Compra Confirmada!</h2>
          <p className="mt-4 mb-2 text-muted">Tus números asignados para la rifa <strong>{raffle.title}</strong> son:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {assignedTickets.map(t => (
              <span 
                key={t} 
                style={{ 
                  backgroundColor: 'var(--primary-cyan)', 
                  color: '#000', 
                  fontWeight: 'bold', 
                  padding: '4px 12px', 
                  borderRadius: '4px', 
                  fontSize: '1.2rem',
                  boxShadow: '0 0 10px rgba(0, 242, 254, 0.5)'
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div style={{ backgroundColor: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--primary-cyan)', padding: '15px', borderRadius: '8px', marginBottom: '1.5rem', position: 'relative' }}>
            <p style={{ color: 'var(--primary-cyan)', fontSize: '0.8rem', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>🔑 Código Secreto de Verificación</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '4px', margin: 0, color: '#fff' }}>{verificationCode}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(verificationCode);
                  const btn = document.getElementById('copy-btn');
                  if (btn) {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '✅';
                    btn.style.borderColor = 'var(--success)';
                    setTimeout(() => {
                      btn.innerHTML = originalText;
                      btn.style.borderColor = 'rgba(255,255,255,0.2)';
                    }, 2000);
                  }
                }}
                id="copy-btn"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s'
                }}
                title="Copiar código"
              >
                📋
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Guarda este código para consultar el estado de tus boletos.</p>
          </div>
          <p className="mb-6 text-sm">El recibo de tu compra y tu código han sido enviados a tu correo (<strong>{formData.email}</strong>). ¡Mucha suerte!</p>
          <button className="btn-primary w-full" onClick={onClose}>CERRAR</button>
        </div>
      </div>
    );
  }

  if (showWarning) {
    return (
      <div className="modal-overlay">
        <div className="modal-content text-center" style={{ maxWidth: '400px' }}>
          <button className="modal-close" onClick={onClose}>×</button>
          <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>⚠️</div>
          <h2 style={{ color: 'var(--accent-orange)' }}>POLÍTICA DE SEGURIDAD</h2>
          <p className="mt-4 mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            Toda reserva de boletos está sujeta a verificación. Si el comprobante enviado es falso o el dinero no se refleja en nuestras cuentas en un plazo máximo de <strong>24 horas</strong>, tus boletos serán cancelados automáticamente y puestos a la venta nuevamente.
          </p>
          <p className="mt-2 mb-6" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Verifica siempre que la cuenta esté a nombre de <strong>Shark RD</strong> antes de realizar transferencias.
          </p>
          <button className="btn-primary w-full" onClick={() => setShowWarning(false)}>
            ENTENDIDO, CONTINUAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          {raffle.image_url && (
            <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
              <img src={raffle.image_url} alt={raffle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <h2>{raffle.title}</h2>
          <p className="subtitle">Boletos Pega 4 (0000 - 9999)</p>
        </div>

        <form onSubmit={handleSubmit} className="buy-form">
          {/* Quantity Section */}
          <div className="form-section">
            <label>CANTIDAD DE BOLETOS</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px', 
                padding: '4px',
                border: '1px solid var(--border-color)' 
              }}>
                <button 
                  type="button" 
                  style={{ 
                    fontSize: '2rem', 
                    width: '60px', 
                    height: '50px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: 'none', 
                    background: 'var(--bg-panel)',
                    borderRadius: '6px',
                    color: 'var(--text-main)', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg-panel)'}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                  style={{ 
                    fontSize: '1.8rem', 
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--primary-cyan)',
                    width: '90px', 
                    textAlign: 'center', 
                    background: 'transparent', 
                    border: 'none', 
                    outline: 'none',
                    padding: '0',
                    margin: '0',
                    boxShadow: 'none'
                  }}
                  min="1"
                />
                <button 
                  type="button" 
                  style={{ 
                    fontSize: '2rem', 
                    width: '60px', 
                    height: '50px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: 'none', 
                    background: 'var(--bg-panel)',
                    borderRadius: '6px',
                    color: 'var(--text-main)', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg-panel)'}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Subtotal</span>
                <span style={{ fontSize: '1.8rem', color: 'var(--accent-orange)', fontWeight: 'bold' }}>RD${(raffle.price * quantity).toLocaleString()}</span>
              </div>
            </div>
            <p className="status-msg text-cyan" style={{ fontSize: '0.8rem' }}>Los números serán asignados automáticamente por el sistema.</p>
          </div>

          {/* User Data Section */}
          <div className="form-section">
            <label>TU NOMBRE COMPLETO</label>
            <input 
              type="text" 
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})} 
              placeholder="Ej: Juan Pérez" 
              required
            />
          </div>
          
          <div className="form-section">
            <label>CÉDULA DE IDENTIDAD</label>
            <input 
              type="text" 
              value={formData.cedula} 
              onChange={e => setFormData({...formData, cedula: e.target.value})} 
              placeholder="Ej: 402-XXXXXXX-X" 
              required
            />
          </div>

          <div className="form-section">
            <label>TELÉFONO / WHATSAPP</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              placeholder="809-XXX-XXXX" 
              required
            />
          </div>

          <div className="form-section">
            <label>CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="tu@correo.com" 
              required
            />
          </div>

          {/* Payment Methods */}
          <div className="form-section">
            <label>MÉTODO DE PAGO</label>
            <div className="payment-options">
              <button 
                type="button" 
                className={`pay-btn ${paymentMethod === 'paypal' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                🌐 PAYPAL
              </button>
              <button 
                type="button" 
                className={`pay-btn ${paymentMethod === 'reservas' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('reservas')}
              >
                🏦 BAN. RESERVAS
              </button>
              <button 
                type="button" 
                className={`pay-btn ${paymentMethod === 'qik' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('qik')}
              >
                ⚡ QIK
              </button>
            </div>

            {paymentMethod === 'paypal' && <div style={{marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Cuenta PayPal: <strong>pagos@sharkrd.com</strong>. Al confirmar, transfiere el monto exacto y guarda tu captura.</div>}
            {paymentMethod === 'reservas' && <div style={{marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Cuenta Ban. Reservas (Ahorro): <strong>960-123456-7</strong> a nombre de Shark RD. Guarda tu comprobante de depósito.</div>}
            {paymentMethod === 'qik' && <div style={{marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Transfiere vía Qik al número: <strong>809-555-0199</strong>. Recuerda tomar captura del pago completado.</div>}
          </div>

          {/* Receipt Upload Section */}
          <div className="form-section mt-4">
            <label>Sube tu captura de pago (JPG, PNG)</label>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setReceiptFile(e.target.files[0]);
                }
              }}
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)', 
                border: receiptFile ? '1px solid var(--success)' : '1px dashed var(--primary-cyan)',
                padding: '10px'
              }}
            />
            {receiptFile && <p className="status-msg text-success mt-1">✓ Comprobante subido ({receiptFile.name})</p>}
          </div>

          {errorMsg && <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid var(--error)', padding: '10px', color: '#ff6b6b', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}

          <div className="total-box">
            <span>TOTAL A PAGAR</span>
            <span className="amount">RD${(raffle.price * quantity).toLocaleString()}</span>
          </div>

          <button type="submit" className="btn-accent w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'PROCESANDO...' : '✅ CONFIRMAR COMPRA Y SUBIR RECIBO'}
          </button>
        </form>
      </div>
    </div>
  );
}
