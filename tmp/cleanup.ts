import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('--- Limpiando base de datos de prueba ---');
  
  // Eliminar todos los tickets
  const { error: tError } = await supabaseAdmin
    .from('tickets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (tError) {
    console.error('Error al limpiar tickets:', tError);
  } else {
    console.log('TICKETS: Limpios (0)');
  }

  // Opcional: Eliminar los participantes de prueba
  const { error: pError } = await supabaseAdmin
    .from('participants')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
  if (pError) {
    console.error('Error al limpiar participantes:', pError);
  } else {
    console.log('PARTICIPANTES: Limpios (0)');
  }
  
  console.log('--- Limpieza Completada ---');
}

cleanup();
