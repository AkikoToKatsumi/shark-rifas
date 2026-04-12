import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendPaymentPendingEmail = async (
  email: string,
  ticketNumber: string,
  raffleTitle: string,
  paymentMethod: string,
  price: number,
  verificationCode: string
) => {
  const mailOptions = {
    from: `"Shark RD Rifas" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `💰 Reserva Recibida - ${raffleTitle}`,
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          <div style="background-color: #f97316; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #000; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Shark RD Rifas</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #f97316; margin-top: 0; font-size: 24px;">¡Tus boletos ya están apartados!</h2>
            <p style="line-height: 1.6; color: #94a3b8;">Hola. Hemos recibido tu comprobante de pago. Tus números para la rifa <strong>${raffleTitle}</strong> están en proceso de validación por nuestro equipo.</p>
            
            <div style="background-color: #020617; padding: 15px; border-radius: 8px; margin: 25px 0; border: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Boletos Reservados:</p>
              <div style="display: inline-block; background-color: #1e293b; padding: 8px 16px; border-radius: 20px; color: #38bdf8; font-weight: bold; font-size: 18px; letter-spacing: 1px;">
                ${ticketNumber}
              </div>
            </div>

            <div style="background-color: #111827; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
              <h3 style="margin: 0 0 10px 0; color: #f97316; font-size: 14px; text-transform: uppercase;">Estado: Esperando Confirmación ⏳</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Total:</strong> RD$${price}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Método:</strong> ${paymentMethod.toUpperCase()}</p>
            </div>

            <div style="background-color: #020617; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #38bdf8;"><strong>🔑 CÓDIGO DE VERIFICACIÓN:</strong></p>
              <p style="margin: 10px 0; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #fff;">${verificationCode}</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">(Úsalo en nuestra web para consultar el estado de tu compra)</p>
            </div>

            <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">Recibirás un nuevo correo tan pronto el dinero se refleje en nuestras cuentas.</p>
          </div>
          <div style="background-color: #1e293b; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            © Shark RD Rifas - Sistema Automatizado de Comprobantes.
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending pending email:', error);
  }
};

export const sendPaymentConfirmedEmail = async (
  email: string,
  ticketNumber: string,
  raffleTitle: string,
  paymentMethod: string,
  price: number,
  verificationCode?: string
) => {
  const mailOptions = {
    from: `"Shark RD Rifas" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🏆 ¡Pago Confirmado! - Boletos para ${raffleTitle}`,
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          <div style="background-color: #38bdf8; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #000; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Shark RD Rifas</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #38bdf8; margin-top: 0; font-size: 24px; text-align: center;">¡Felicidades, pago aceptado!</h2>
            <p style="text-align: center; color: #94a3b8;">Tu participación ha sido confirmada exitosamente. Aquí tienes tu recibo oficial.</p>

            <div style="background-color: #020617; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #38bdf8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tus Boletos Oficiales:</p>
              <div style="display: inline-block; background-color: #38bdf8; color: #000; padding: 10px 25px; border-radius: 50px; font-weight: bold; font-size: 24px; letter-spacing: 2px;">
                ${ticketNumber}
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 15px;">Rifa: <strong>${raffleTitle}</strong></p>
            </div>

            <div style="background-color: #064e3b; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #10b981;">
              <h3 style="margin: 0; color: #10b981; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                 PAGADO ✅
              </h3>
              <div style="margin-top: 10px; font-size: 13px; color: #d1fae5; text-align: center;">
                Recibo final por un monto de <strong>RD$${price}</strong> via ${paymentMethod.toUpperCase()}.
              </div>
            </div>

            ${verificationCode ? `
            <div style="background-color: #020617; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">CÓDIGO DE VERIFICACIÓN:</p>
              <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #fff;">${verificationCode}</p>
            </div>
            ` : ''}

            <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">Guarda este correo, es tu comprobante de participación. ¡Muchísima suerte!</p>
          </div>
          <div style="background-color: #1e293b; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            © Shark RD Rifas - ¡Rifas 100% Seguras!
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

export const sendAdminReceiptEmail = async (
  fullName: string,
  phone: string,
  email: string,
  cedula: string,
  ticketNumber: string,
  raffleTitle: string,
  paymentMethod: string,
  totalPrice: number,
  receiptImageBase64: string, // expects format like "data:image/png;base64,iVBORw0KGgo..."
  verificationCode: string
) => {
  // Extract content type and base64 data
  const matches = receiptImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  let attachments = [];
  if (matches && matches.length === 3) {
    attachments.push({
      filename: `comprobante-${ticketNumber}.png`,
      content: matches[2],
      encoding: 'base64'
    });
  }

  const mailOptions = {
    from: `"Shark RD Notificaciones" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_FROM, // Send to the admin's own email
    subject: `💰 Nuevo Pago Registrado - ${raffleTitle}`,
    html: `
      <h2>Notificación de Nuevo Pago</h2>
      <p>Un cliente acaba de subir un comprobante de pago para una compra directa.</p>
      <hr />
      <h3>Detalles del Cliente:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${fullName}</li>
        <li><strong>Cédula:</strong> ${cedula}</li>
        <li><strong>Teléfono:</strong> ${phone}</li>
        <li><strong>Correo:</strong> ${email}</li>
      </ul>
      <h3>Detalles de la Compra:</h3>
      <ul>
        <li><strong>Rifa:</strong> ${raffleTitle}</li>
        <li><strong>Boletos:</strong> ${ticketNumber}</li>
        <li><strong>Monto Total:</strong> RD$${totalPrice}</li>
        <li><strong>Método:</strong> ${paymentMethod.toUpperCase()}</li>
        <li><strong>Cód. Verificación:</strong> ${verificationCode}</li>
      </ul>
      <p>El comprobante de pago se encuentra adjunto a este correo electrónico.</p>
    `,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending admin receipt email:', error);
  }
};

export const sendPaymentRejectedEmail = async (
  email: string,
  ticketNumber: string,
  raffleTitle: string,
  verificationCode?: string
) => {
  const mailOptions = {
    from: `"Shark RD Rifas" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `❌ Reserva Cancelada / Rechazada - ${raffleTitle}`,
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Shark RD Rifas</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #ef4444; margin-top: 0; font-size: 24px; text-align: center;">Reserva Cancelada / Anulada</h2>
            <p style="text-align: center; color: #94a3b8; line-height: 1.6;">Lamentamos informarte que tu solicitud de compra ha sido rechazada o anulada por la administración. Los siguientes números han sido liberados y ya no te pertenecen:</p>

            <div style="background-color: #020617; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #ef4444; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Boletos Liberados:</p>
              <div style="display: inline-block; background-color: #ef4444; color: #fff; padding: 8px 16px; border-radius: 12px; font-weight: bold; font-size: 18px; letter-spacing: 2px;">
                ${ticketNumber}
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 15px;">Rifa: <strong>${raffleTitle}</strong></p>
            </div>

            <div style="background-color: #450a0a; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #7f1d1d; text-align: center;">
              <p style="margin: 0; color: #fca5a5; font-size: 14px;">
                Si crees que esto es un error, si ya realizaste el pago y se te rechazó por error, por favor comunícate urgentemente a nuestro número de WhatsApp o correo electrónico oficial.
              </p>
            </div>

            <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">Gracias por tu comprensión.</p>
          </div>
          <div style="background-color: #1e293b; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            © Shark RD Rifas
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};

export const sendWelcomeEmail = async (
  email: string,
  fullName: string,
  points: number
) => {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  const hasLogo = fs.existsSync(logoPath);

  const mailOptions = {
    from: `"Shark RD Rifas" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `👋 ¡Bienvenido a Shark RD Rifas, ${fullName}!`,
    attachments: hasLogo ? [{
      filename: 'logo.png',
      path: logoPath,
      cid: 'sharklogo'
    }] : [],
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          
          <div style="background-color: #000; padding: 30px 20px; text-align: center; border-bottom: 2px solid #00f2fe;">
            ${hasLogo ? `<img src="cid:sharklogo" width="180" alt="Shark RD Rifas" style="display: block; margin: 0 auto;" />` : ''}
            <h1 style="margin: 20px 0 0 0; color: #00f2fe; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">¡Cuenta Creada Exitosamente!</h1>
          </div>

          <div style="padding: 30px;">
            <h2 style="color: #fff; margin-top: 0; font-size: 24px;">Hola, ${fullName}</h2>
            <p style="line-height: 1.6; color: #94a3b8; font-size: 15px;">
              ¡Gracias por registrarte en el sistema oficial de <strong>Shark RD Rifas</strong>! Nos alegra mucho verte formar parte de nuestra comunidad de ganadores.
            </p>
            
            <div style="background-color: #020617; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #00f2fe; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tu Balance Actual de Puntos:</p>
              <div style="display: inline-block; background-color: rgba(0, 242, 254, 0.1); color: #00f2fe; padding: 10px 25px; border-radius: 50px; border: 1px solid rgba(0, 242, 254, 0.3); font-weight: bold; font-size: 24px; letter-spacing: 2px;">
                💎 ${points} pts
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 15px;">
                <em>¡Recuerda entrar todos los días para girar la ruleta y ganar puntos gratis!</em>
              </p>
            </div>

            <div style="background-color: #111827; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
              <h3 style="margin: 0 0 10px 0; color: #f97316; font-size: 14px; text-transform: uppercase;">Beneficios de tu Cuenta:</h3>
              <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 5px;"><strong>Autocompletado Rápido</strong> al comprar boletos.</li>
                <li style="margin-bottom: 5px;"><strong>Historial Instantáneo</strong> en el verificador, sin necesidad de códigos.</li>
                <li style="margin-bottom: 0;">Opción de <strong>Pagar Boletos Gratis</strong> canjeando tus puntos acumulados.</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">
              Si tienes alguna pregunta, no dudes en contactarnos vía WhatsApp o respondiendo a este correo.
            </p>
          </div>
          <div style="background-color: #1e293b; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            © Shark RD Rifas - Tu Suerte, Tu Destino.
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  pin: string
) => {
  const mailOptions = {
    from: `"Shark RD Rifas" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🔐 Recuperación de Contraseña - Shark RD`,
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          
          <div style="background-color: #000; padding: 25px; text-align: center; border-bottom: 2px solid #00f2fe;">
            <h1 style="margin: 0; color: #00f2fe; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Shark RD Rifas</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #fff; margin-top: 0; font-size: 24px;">Hola, ${fullName}</h2>
            <p style="line-height: 1.6; color: #94a3b8; font-size: 15px;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no hiciste esta solicitud, puedes ignorar este correo.
            </p>
            
            <div style="background-color: #020617; padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #00f2fe; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tu Código de Recuperación:</p>
              <div style="display: inline-block; background-color: rgba(0, 242, 254, 0.1); color: #fff; padding: 15px 30px; border-radius: 8px; border: 1px dashed #00f2fe; font-weight: bold; font-size: 32px; letter-spacing: 8px;">
                ${pin}
              </div>
              <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
                <em>Este código expirará en 30 minutos por motivos de seguridad.</em>
              </p>
            </div>

            <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center; line-height: 1.5;">
              Para completar el proceso, ingresa este código en la ventana de recuperación en nuestro sitio web.
            </p>
          </div>
          
          <div style="background-color: #1e293b; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            © Shark RD Rifas - Seguridad y Confianza.
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
