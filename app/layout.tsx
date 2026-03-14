import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import WhatsAppButton from "./components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Shark RD Rifas",
  description: "Sistema de Rifas Virtuales en República Dominicana",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LoadingScreen />
        <Header />
        <main className="container">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
