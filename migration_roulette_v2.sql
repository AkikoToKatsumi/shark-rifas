-- Ejecuta esto en el panel de SQL de Supabase para habilitar la lógica avanzada de la ruleta

-- Añadimos columnas para rastrear el uso de la ruleta
ALTER TABLE public.participants 
ADD COLUMN total_spins INTEGER DEFAULT 0,
ADD COLUMN last_spin_count INTEGER DEFAULT 0;

-- Nota: Puedes inicializar total_spins basado en si ya tenían una last_spin_date
UPDATE public.participants 
SET total_spins = 1 
WHERE last_spin_date IS NOT NULL AND total_spins = 0;
