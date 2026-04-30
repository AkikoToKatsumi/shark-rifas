import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const session = await getAdminSession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json({ 
    authenticated: true
  });
}
