import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    const isValidUser = username === process.env.ADMIN_USER;
    const isValidPass = password === process.env.ADMIN_SECRET_KEY;

    if (isValidUser && isValidPass) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
