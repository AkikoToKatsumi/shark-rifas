/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de cabeceras de seguridad para cumplir con auditorías
  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas las rutas del sitio
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // CSP estricta: previene XSS limitando de dónde se pueden cargar scripts, estilos e imágenes
            // Permitimos 'self' (el propio dominio) y Supabase para la funcionalidad base
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
          {
            key: 'X-Frame-Options',
            // Previene ataques de Clickjacking prohibiendo que el sitio sea cargado en un iframe
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            // Previene el MIME-sniffing, forzando al navegador a respetar el Content-Type declarado
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            // Controla cuánta información de referencia se envía al navegar fuera del sitio
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Desactiva funciones del navegador que no son necesarias (cámara, micro, etc) para mayor privacidad
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
