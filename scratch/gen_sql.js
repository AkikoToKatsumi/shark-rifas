const bcrypt = require('bcryptjs');
const password = 'Cashshark26@.';
bcrypt.hash(password, 10).then(hash => {
    console.log('\n-- COPIA ESTO Y PÉGALO EN EL SQL EDITOR DE SUPABASE --\n');
    console.log(`INSERT INTO public.participants (full_name, email, phone, password_hash, is_cash_collector, cedula, customer_code) 
VALUES ('Cobrador Efectivo', 'efectivo@sharkrifas.com', '0000000000', '${hash}', true, '00000000000', 'CASH');`);
});
