-- Ejecuta esto en el panel de SQL de Supabase

-- Tabla Roles/Permisos Admin no es necesaria si solo usas 1 clave maestra
-- Tabla Rifas
CREATE TABLE public.raffles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    emoji VARCHAR(50),
    ticket_price NUMERIC(10, 2) NOT NULL,
    total_tickets INTEGER NOT NULL,
    draw_date DATE,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Participantes (quienes compran y cuentas de usuarios)
CREATE TABLE public.participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cedula VARCHAR(20), -- Identificador único
    customer_code VARCHAR(10), -- Código secuencial para administración (ej: 001)
    
    -- Campos del Sistema de Recompensas y Login
    password_hash VARCHAR(255), -- Si es null, es un participante "invitado"
    points INTEGER DEFAULT 0, -- Puntos para canjear por boletos
    last_spin_date DATE, -- Para controlar el premio diario de la ruleta
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Tickets (relación entre Rifa, Participante y el Número 4-dígitos)
CREATE TABLE public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    ticket_number VARCHAR(4) NOT NULL, -- Ej: '0034', '9999'
    status VARCHAR(50) DEFAULT 'reserved', -- 'reserved', 'paid', 'winner'
    payment_method VARCHAR(50), -- 'paypal', 'banreservas', 'qik'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(raffle_id, ticket_number) -- Un número no puede repetirse en la misma rifa
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas: Cualquiera puede ver las rifas y tickets para saber cuáles están ocupados
CREATE POLICY "Raffles are viewable by everyone" ON public.raffles FOR SELECT USING (true);
CREATE POLICY "Tickets are viewable by everyone" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Participants are viewable by everyone" ON public.participants FOR SELECT USING (true);

-- Insertar se debe hacer desde una clave de servicio (Service Role Key) en el backend (Next.js API route)
-- Esto previene que usuarios maliciosos inserten datos directamente por la API pública de Supabase.
