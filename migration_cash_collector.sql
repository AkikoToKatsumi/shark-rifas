-- Migración: Agregar soporte para cobrador en efectivo
-- Ejecutar en el panel SQL de Supabase

-- 1. Agregar campo a la tabla de participantes
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS is_cash_collector BOOLEAN DEFAULT false;

-- 2. (Opcional) crear el usuario cobrador directamente desde SQL si no existe aún
-- Sustituye los valores entre <> con los datos reales del cobrador.
-- INSERT INTO public.participants (full_name, phone, email, cedula, password_hash, is_cash_collector)
-- VALUES ('<NOMBRE>', '<TELEFONO>', '<EMAIL>', '<CEDULA>', '<PASSWORD_HASH_BCRYPT>', true);

-- Para marcar como cobrador a un usuario ya existente (por email):
-- UPDATE public.participants SET is_cash_collector = true WHERE email = '<EMAIL_DEL_COBRADOR>';
