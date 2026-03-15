import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_table_info', { table_name: 'tickets' });
    
    // If RPC doesn't exist, try a direct query to information_schema if permissions allow
    // But since RLS might block, we try to just select one record with all columns
    const { data: columnsData, error: colsError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .limit(1);

    return NextResponse.json({ 
      tableName: 'tickets',
      hasData: !!columnsData,
      columns: columnsData && columnsData.length > 0 ? Object.keys(columnsData[0]) : 'no records found',
      error: colsError
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
