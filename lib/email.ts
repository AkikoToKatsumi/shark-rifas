import nodemailer from 'nodemailer';

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
