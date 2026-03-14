// ts-node no requerido, podemos correrlo como un script de Node plano con dotenv
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log("Iniciando prueba de correo...");
  console.log("Revisando credenciales...");
  
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error("❌ ERROR: Faltan credenciales en tu archivo .env.local.");
    console.log("Por favor agrega EMAIL_SERVER_USER y EMAIL_SERVER_PASSWORD a tu archivo .env.local");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_SERVER_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Shark RD Rifas (Prueba)" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to: process.env.EMAIL_SERVER_USER, // Te lo envías a ti mismo como prueba
    subject: `¡Prueba de Sistema de Recibos!`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #050a10; color: #f0f4f8; padding: 20px;">
        <h2 style="color: #00ff88;">¡Hola Gabriela! La conexión de correo funciona perfectamente.</h2>
        <p>Si estás viendo esto, significa que cuando apruebes un ticket en el panel, el cliente recibirá su factura sin problemas.</p>
      </div>
    `,
  };

  try {
    console.log(`Intentando enviar correo de prueba a ${process.env.EMAIL_SERVER_USER}...`);
    await transporter.sendMail(mailOptions);
    console.log("✅ ¡ÉXITO! Correo enviado correctamente. Revisa tu bandeja de entrada.");
  } catch (error) {
    console.error("❌ ERROR AL ENVIAR CORREO:");
    console.error(error);
  }
}

testEmail();
