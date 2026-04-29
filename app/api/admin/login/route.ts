import { NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    const isValidUser = username === process.env.ADMIN_USER;
    const isValidPass = password === process.env.ADMIN_SECRET_KEY;

    if (isValidUser && isValidPass) {
      await setAdminSession(password);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
