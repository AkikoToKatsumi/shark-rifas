'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Landmark, Zap, ShieldAlert, CheckCircle, Smartphone, Gift, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function BuyModal({ raffle, onClose }: { raffle: any, onClose: () => void }) {
  const [quantity, setQuantity] = useState(raffle.min_tickets || 1);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', cedula: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [assignedTickets, setAssignedTickets] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { user } = useAuth();

  const POINTS_PER_TICKET = 500;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        // using optional chaining for cedula if it exists
        cedula: (user as any).cedula || prev.cedula
      }));
    }
  }, [user]);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    };
  }, []);
  // Ticket management functions removed - now automated by backend

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName || !formData.phone || !formData.email || !formData.cedula) {
      setErrorMsg("Por favor completa todos tus datos personales incluyendo tu cédula.");
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg("Debe leer y aceptar los Términos y Condiciones para continuar.");
      return;
    }
    if (quantity < (raffle.min_tickets || 1)) {
      setErrorMsg(`La cantidad mínima es ${raffle.min_tickets || 1} boletos.`);
      return;
    }
    if (!paymentMethod) {
      setErrorMsg("Seleccione un método de pago.");
      return;
    }

    if (paymentMethod === 'points') {
      if (!user) {
        setErrorMsg("Debes iniciar sesión para usar puntos.");
        return;
      }
      if (user.points < quantity * POINTS_PER_TICKET) {
        setErrorMsg(`Puntos insuficientes. Necesitas ${quantity * POINTS_PER_TICKET} puntos.`);
        return;
      }
    } else if (paymentMethod !== 'cash') {
      if (!receiptFile) {
        setErrorMsg("Debes subir tu comprobante de pago para confirmar la compra.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let receiptDataUrl = null;
      if (receiptFile) {
        // Use FileReader for better browser compatibility (avoid Buffer on client)
        receiptDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(new Error("Error al leer el archivo de imagen."));
          reader.readAsDataURL(receiptFile);
        });
      }

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
          receiptImage: receiptDataUrl,
          isCashContact: paymentMethod === 'cash_info',
          collectorId: user?.is_cash_collector ? user.id : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la reserva. Por favor intenta de nuevo.');
      }

      setAssignedTickets(data.assignedTickets || []);
      setVerificationCode(data.verificationCode || '');
      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#4facfe', '#ffffff']
      });
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
          <div className="flex justify-center mb-4">
            <ShieldAlert size={60} color="var(--accent-orange)" />
          </div>
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

  if (showTermsModal) {
    return (
      <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
          <button className="modal-close" onClick={() => setShowTermsModal(false)}>×</button>
          <div className="flex justify-center mb-4">
            <ShieldAlert size={50} className="text-cyan-400" />
          </div>
          <h2 style={{ color: 'var(--primary-cyan)', marginBottom: '15px' }}>Términos y Condiciones</h2>

          <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p><strong>1. Dinámica del Sorteo:</strong> La rifa se efectuará cuando se alcance el 75% de boletos vendidos; en caso contrario, se anunciará el cambio del premio o modalidad.</p>
            <p><strong>2. Veracidad de Datos:</strong> Los datos proporcionados (Nombre, Cédula y Teléfono/WhatsApp) deben ser reales y exactos. El premio solo se entregará al titular de la cédula registrada en la compra. Si los datos son falsos, el boleto ganador será invalidado.</p>
            <p><strong>3. Validación del Pago:</strong> En los pagos mediante transferencia bancaria, el boleto no será válido ni estará asegurado hasta que la administración confirme la recepción de los fondos. Enviar el comprobante no asegura los números si el pago es rechazado.</p>
            <p><strong>4. Transferencias Interbancarias (Fines de Semana y Feriados):</strong> Si realizas una transferencia desde un banco diferente durante un fin de semana (sábado y domingo) o en un día no laborable (feriado), la transacción no será aprobada el mismo día, sino hasta que el dinero se refleje efectivamente en nuestra cuenta en el siguiente día hábil/laborable.</p>
            <p><strong>5. Política de Reembolso:</strong> Las ventas de boletos son finales. No se aceptan cancelaciones, devoluciones ni reembolsos de dinero bajo ninguna circunstancia (salvo cancelación total del evento por parte de los organizadores).</p>
            <p><strong>6. Reclamación:</strong> El ganador dispondrá de un plazo máximo de <strong>15 días</strong> a partir de la fecha del sorteo para reclamar su premio presentando físicamente la cédula original registrada en la compra.</p>
            <p><strong>7. Uso de Imagen:</strong> Al participar y ganar, el usuario autoriza a Shark Rifas a utilizar su imagen (fotos/videos del momento de entrega) exclusivamente con fines de transparencia y publicidad en redes sociales.</p>
          </div>

          <button className="btn-primary w-full mt-6" onClick={() => {
            setAcceptedTerms(true);
            setShowTermsModal(false);
            setTimeout(() => {
              const modalEl = document.querySelector('.modal-content');
              if (modalEl) modalEl.scrollTo({ top: modalEl.scrollHeight, behavior: 'smooth' });
            }, 50);
          }}>
            ACEPTAR TÉRMINOS Y CONTINUAR
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
          <p className="subtitle">Pick 4 Florida</p>
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
                  onClick={() => setQuantity(Math.max(raffle.min_tickets || 1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(raffle.min_tickets || 1, parseInt(e.target.value) || (raffle.min_tickets || 1)))}
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
                  min={raffle.min_tickets || 1}
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
            {raffle.min_tickets > 1 && (
              <p className="status-msg" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)' }}>
                ⚠️ Compra mínima de {raffle.min_tickets} boletos para esta oferta.
              </p>
            )}
          </div>

          {/* User Data Section */}
          <div className="form-section">
            <label>TU NOMBRE COMPLETO</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="form-section">
            <label>CÉDULA DE IDENTIDAD</label>
            <input
              type="text"
              value={formData.cedula}
              onChange={e => setFormData({ ...formData, cedula: e.target.value })}
              placeholder="Ej: 402-XXXXXXX-X"
              required
            />
          </div>

          <div className="form-section">
            <label>TELÉFONO / WHATSAPP</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="809-XXX-XXXX"
              required
            />
          </div>

          <div className="form-section">
            <label>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@correo.com"
              required
            />
          </div>

          {/* Payment Methods */}
          <div className="form-section">
            <label>MÉTODO DE PAGO</label>

            {/* ── COBRADOR EN EFECTIVO: solo muestra botón de cash ── */}
            {user?.is_cash_collector ? (
              <button
                type="button"
                className={`pay-btn w-full ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  border: paymentMethod === 'cash' ? '2px solid var(--success)' : '2px dashed rgba(34,197,94,0.4)',
                  background: paymentMethod === 'cash' ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: paymentMethod === 'cash' ? 'var(--success)' : 'var(--text-muted)',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <Banknote size={24} />
                PAGO EN EFECTIVO
              </button>
            ) : (
              /* ── USUARIOS NORMALES: bancos ── */
              <>{paymentMethod !== 'points' && (
                <div className="payment-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    className={`pay-btn ${paymentMethod === 'paypal' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px 5px' }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '20px' }} />
                    <span style={{ fontSize: '0.7rem' }}>PAYPAL</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-btn ${paymentMethod === 'reservas' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('reservas')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px 5px' }}
                  >
                    <img src="/banreservas.png" alt="Reservas" style={{ height: '30px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.65rem' }}>BANRESERVAS</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-btn ${paymentMethod === 'qik' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('qik')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px 5px' }}
                  >
                    <img src="/qik.png" alt="Qik" style={{ height: '30px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.8rem' }}>QIK</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-btn ${paymentMethod === 'bhd' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('bhd')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px 5px' }}
                  >
                    <img src="/bhd-logo.png" alt="BHD" style={{ height: '30px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.8rem' }}>BHD</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-btn ${paymentMethod === 'cash_info' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash_info')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px 5px' }}
                  >
                    <Banknote size={24} className={paymentMethod === 'cash_info' ? 'text-success' : 'text-muted'} />
                    <span style={{ fontSize: '0.7rem' }}>EFECTIVO</span>
                  </button>
                </div>
              )}</>
            )}

          {paymentMethod === 'cash_info' && (
            <div style={{ 
              marginTop: '15px', 
              padding: '20px', 
              background: 'rgba(34,197,94,0.05)', 
              borderRadius: '12px', 
              border: '1px solid rgba(34,197,94,0.2)',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '10px' }}>🤝 PAGO EN PERSONA</p>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-main)', marginBottom: '15px' }}>
                Si quieres pagar en efectivo comunícate con nosotros para acordar un lugar y hora para poder hacer tu pago y entregar tu comprobante en físico.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>849-578-9996</span>
                <button 
                  type="button"
                  id="copy-phone-btn"
                  onClick={() => {
                    navigator.clipboard.writeText('8495789996');
                    const btn = document.getElementById('copy-phone-btn');
                    if (btn) {
                      btn.innerHTML = '✅';
                      setTimeout(() => btn.innerHTML = '📋', 2000);
                    }
                  }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  title="Copiar número"
                >
                  📋
                </button>
              </div>

              <a 
                href={`https://wa.me/18495789996?text=Hola,%20quiero%20pagar%20en%20efectivo%20${quantity}%20boletos%20para%20la%20rifa%20${encodeURIComponent(raffle.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: '#25D366', 
                  border: 'none',
                  padding: '10px 20px',
                  fontSize: '0.9rem'
                }}
              >
                <Smartphone size={18} /> CONTACTAR POR WHATSAPP
              </a>
            </div>
          )}

          {paymentMethod && paymentMethod !== 'points' && paymentMethod !== 'cash_info' && (
              <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(() => {
                  let details = { name: '', number: '', holder: 'SHARK RD', type: '', extra: '', isPaypal: false };

                  if (paymentMethod === 'paypal') {
                    details = { name: 'PAYPAL', number: 'adminsharkrd@gmail.com', holder: 'SharkRDrifas', type: 'US$ Dólares', extra: '', isPaypal: true };
                  } else if (paymentMethod === 'reservas') {
                    details = { name: 'BANCO RESERVAS', number: '9609127509', holder: 'Erick Eduardo Inoa D.', type: 'CUENTA CORRIENTE PERSONAL', extra: '', isPaypal: false };
                  } else if (paymentMethod === 'qik') {
                    details = { name: 'QIK', number: '1009585431', holder: 'Gabriela García R. o Erick E. Inoa D.', type: 'CUENTA DE AHORROS COMPARTIDA | ESTÁNDAR: DO68QDDM00000000001009585431', extra: '', isPaypal: false };
                  } else if (paymentMethod === 'bhd') {
                    details = { name: 'BANCO BHD', number: '39503890027', holder: 'Erick Eduardo Inoa D.', type: 'CUENTA MÓVIL (AHORROS)', extra: '', isPaypal: false };
                  }

                  const handleCopy = (text: string, id: string) => {
                    navigator.clipboard.writeText(text);
                    const btn = document.getElementById(id);
                    if (btn) {
                      const originalText = btn.innerHTML;
                      btn.innerHTML = 'Copiado!';
                      btn.style.backgroundColor = 'var(--success)';
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = 'var(--primary-cyan)';
                      }, 2000);
                    }
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ color: 'var(--primary-cyan)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase' }}>{details.name}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>{details.number}</span>
                        <button
                          type="button"
                          id="copy-account-btn"
                          onClick={() => handleCopy(details.number, 'copy-account-btn')}
                          style={{
                            background: 'var(--primary-cyan)',
                            color: '#000',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Smartphone size={14} /> Copiar
                        </button>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '5px' }}>
                        <p style={{ margin: 0 }}>TITULAR: <span style={{ color: 'var(--text-main)' }}>{details.holder}</span></p>
                        <p style={{ margin: 0 }}>TIPO: <span style={{ color: 'var(--text-main)' }}>{details.type}</span></p>
                        {!details.isPaypal && (
                          <div style={{ margin: '8px 0 0 0', padding: '8px 10px', background: 'rgba(255, 140, 0, 0.1)', borderLeft: '3px solid var(--accent-orange)', borderRadius: '4px' }}>
                            <p style={{ margin: 0, color: 'var(--accent-orange)', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '3px' }}>⚠️ NOTA IMPORTANTE:</p>
                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                              En el concepto de tu transferencia debes poner <strong>exclusivamente</strong> alguna de estas frases: <strong style={{ color: '#fff', backgroundColor: '#000', padding: '2px 5px', borderRadius: '3px' }}>PAGO DE BOLETO</strong> o <strong style={{ color: '#fff', backgroundColor: '#000', padding: '2px 5px', borderRadius: '3px' }}>PAGO RIFA</strong>.
                            </p>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', marginTop: '5px', fontStyle: 'italic' }}>
                        {details.isPaypal ? 'Al confirmar, transfiere el monto exacto y guarda tu captura.' : 'Guarda tu comprobante de depósito o captura de pantalla.'}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {user && (
              <div style={{ marginTop: '15px' }}>
                <button
                  type="button"
                  className={`pay-btn flex items-center justify-center gap-2 w-full ${paymentMethod === 'points' ? 'selected' : ''}`}
                  style={{ border: paymentMethod === 'points' ? '2px solid var(--primary-cyan)' : '1px solid rgba(0,242,254,0.3)', background: paymentMethod === 'points' ? 'rgba(0,242,254,0.1)' : 'transparent', padding: '12px' }}
                  onClick={() => setPaymentMethod('points')}
                >
                  <Gift size={20} color="var(--primary-cyan)" />
                  <span>Pagar con Puntos (Total: {quantity * POINTS_PER_TICKET} pts)</span>
                </button>
                {paymentMethod === 'points' && (
                  <p className="mt-2 text-center" style={{ fontSize: '0.9rem', color: user.points >= quantity * POINTS_PER_TICKET ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>
                    {user.points >= quantity * POINTS_PER_TICKET
                      ? `✓ Tienes puntos suficientes (${user.points} pts)`
                      : `❌ Puntos insuficientes (${user.points} pts)`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Receipt Upload Section */}
          {paymentMethod !== 'points' && (
            <div className="form-section mt-4">
              <label>Sube tu captura de pago (JPG, PNG)</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    // 4MB limit check
                    if (file.size > 4 * 1024 * 1024) {
                      setErrorMsg("La imagen es demasiado grande (máximo 4MB). Por favor, intenta con una captura de menor peso o comprímela.");
                      setReceiptFile(null);
                      e.target.value = ''; // Clear input
                      return;
                    }
                    setErrorMsg(""); // Clear error if size is okay
                    setReceiptFile(file);
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
          )}

          <div className="form-section mt-4" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-cyan)', marginTop: '2px' }}
            />
            <label htmlFor="terms-checkbox" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, cursor: 'pointer', lineHeight: '1.4' }}>
              He leído y acepto los <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }} style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>Términos y Condiciones</span> de la rifa.
            </label>
          </div>

          {errorMsg && <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid var(--error)', padding: '10px', color: '#ff6b6b', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}

          <div className="total-box">
            <span>TOTAL A PAGAR</span>
            <span className="amount">RD${(raffle.price * quantity).toLocaleString()}</span>
          </div>

          <button type="submit" className="btn-accent w-full mt-4 flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? 'PROCESANDO...' : (
              <>
                <CheckCircle size={18} /> {paymentMethod === 'points' ? 'CONFIRMAR COMPRA CON PUNTOS' : 'CONFIRMAR COMPRA Y SUBIR RECIBO'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
