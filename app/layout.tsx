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
      <head>
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'none'; script-src 'self' 'unsafe-inline' https://vyjzwquvhrfzflxynwih.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://vyjzwquvhrfzflxynwih.supabase.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://vyjzwquvhrfzflxynwih.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
        />
      </head>
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
