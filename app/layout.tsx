import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

import Footer from "./components/Footer";

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
        <Header />
        <main className="container">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
