'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "18095550199"; // Reemplazar con el número real del usuario
  const message = encodeURIComponent("¡Hola! Me gustaría obtener más información sobre las rifas de Shark RD.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="whatsapp-float"
      title="Contactar por WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="whatsapp-pulse"></span>
    </a>
  );
}
