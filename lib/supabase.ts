import { createClient } from '@supabase/supabase-js';

// Usamos el Service Role Key para hacer operaciones protegidas desde el backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
