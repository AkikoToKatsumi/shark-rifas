import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Shark RD RIFAS",
  description: "Sistema de Rifas Virtuales en República Dominicana",
  icons: {
    icon: '/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <LoadingScreen />
          <Header />
          <main className="container">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
