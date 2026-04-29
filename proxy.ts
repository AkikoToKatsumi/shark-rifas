import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/session';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rutas administrativas que queremos proteger
  const isAdminPath = path.startsWith('/admin');
  const isAdminApi = path.startsWith('/api/admin');

  // Ignorar la ruta de login para no crear un bucle infinito
  if (path === '/api/admin/login' || path === '/admin/login') {
    return NextResponse.next();
  }

  if (isAdminPath || isAdminApi) {
    const session = request.cookies.get('admin_session')?.value;

    if (!session) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'No autorizado (sin sesión)' }, { status: 401 });
      }
      // Si no es API, pero es /admin y no hay sesión, 
      // el componente cliente de /admin ya maneja el estado de login visualmente,
      // pero podríamos redirigir si quisiéramos una protección más estricta.
      // Por ahora dejamos que pase para que el formulario de login se muestre,
      // pero las APIs fallarán.
      return NextResponse.next();
    }

    const payload = await decrypt(session);

    if (!payload || payload.role !== 'admin') {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
