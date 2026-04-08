-- Ejecuta este código en el SQL Editor de tu panel de Supabase 
-- para añadir las columnas necesarias para el sistema de recompensas

ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_spin_date DATE;
