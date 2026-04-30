/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de cabeceras de seguridad para cumplir con auditorías
  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas las rutas del sitio
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // CSP ultra-estricta: sin espacios después de los puntos y coma para compatibilidad máxima con algunos auditores
            value: "default-src 'none';script-src 'self' https://vyjzwquvhrfzflxynwih.supabase.co;style-src 'self' https://fonts.googleapis.com;img-src 'self' data: blob: https://vyjzwquvhrfzflxynwih.supabase.co;font-src 'self' https://fonts.gstatic.com;connect-src 'self' https://vyjzwquvhrfzflxynwih.supabase.co;object-src 'none';media-src 'none';worker-src 'none';base-uri 'none';form-action 'self';frame-ancestors 'none';upgrade-insecure-requests;",
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
