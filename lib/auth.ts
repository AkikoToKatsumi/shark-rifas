import { NextResponse } from 'next/server';
import { getAdminSession } from './session';

/**
 * Valida si la petición proviene de un administrador autenticado mediante sesión de cookie.
 * @returns El objeto de sesión si es válido, null de lo contrario.
 */
export async function validateAdminSession() {
  const session = await getAdminSession();
  
  if (!session || session.role !== 'admin') {
    return null;
  }
  
  return session;
}

/**
 * Respuesta estándar para denegar acceso no autorizado.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
