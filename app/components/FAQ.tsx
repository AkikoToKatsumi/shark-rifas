'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle, ShieldCheck, Wallet, Trophy } from 'lucide-react';

const faqData = [
  {
    question: "¿Es seguro participar en Shark RD?",
    answer: "¡Totalmente! Shark RD es una plataforma transparente con más de 50 ganadores reales cada mes. Los sorteos se realizan con base en los resultados oficiales de las loterías nacionales para garantizar imparcialidad total.",
    icon: <ShieldCheck size={20} className="text-cyan-400" />
  },
  {
    question: "¿Cómo puedo pagar mis boletos?",
    answer: "Aceptamos transferencias vía Banreservas, pagos rápidos por Qik y PayPal. Una vez realices la transferencia, subes tu comprobante en el botón de compra para que validemos tu boleto.",
    icon: <Wallet size={20} className="text-cyan-400" />
  },
  {
    question: "¿Qué pasa si gano un premio rápido (RD$8,000)?",
    answer: "Si tu número coincide con uno de nuestros 'Números Ganadores' al momento de la compra, te contactamos vía WhatsApp inmediatamente para realizarte la transferencia del premio tras validar tu pago.",
    icon: <Trophy size={20} className="text-cyan-400" />
  },
  {
    question: "¿Cómo sé cuándo es el sorteo principal?",
    answer: "Cada rifa tiene una fecha de sorteo establecida que puedes ver en su tarjeta. Generalmente se realizan los fines de semana. Avisamos a todos los participantes vía WhatsApp y correo sobre los resultados.",
    icon: <HelpCircle size={20} className="text-cyan-400" />
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq-section">
      <div className="section-header">
        <h2>💬 PREGUNTAS FRECUENTES</h2>
        <div className="header-line"></div>
      </div>

      <div className="faq-container">
        {faqData.map((item, index) => (
          <div key={index} className="faq-item">
            <div 
              className="faq-header" 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.question}</span>
              </div>
              {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
