const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- Checking participants table columns ---');
  const { data: pData, error: pError } = await supabase
    .from('participants')
    .select('*')
    .limit(1);

  if (pError) {
    console.error('Error querying participants table:', pError);
  } else if (pData && pData.length > 0) {
    console.log('Participants columns found:', Object.keys(pData[0]));
  } else {
    console.log('No participants found, checking for cedula column...');
    const { error: cError } = await supabase.from('participants').select('cedula').limit(1);
    console.log('cedula column check:', cError ? 'MISSING' : 'FOUND');
  }

  console.log('\n--- Checking tickets table columns ---');
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying tickets table:', error);
  } else if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
    console.log('Sample record status:', data[0].status);
  }

  console.log('\n--- Testing insertion with status "pending" ---');
  // We need a valid raffle_id and participant_id to test this
  // Let's just try to insert a dummy record and catch the error
  const { error: insError } = await supabase
    .from('tickets')
    .insert([{
      raffle_id: '00000000-0000-0000-0000-000000000000', // invalid uuid
      participant_id: '00000000-0000-0000-0000-000000000000',
      ticket_number: 'TEST',
      status: 'pending',
      verification_code: 'TEST'
    }]);
  
  if (insError) {
    console.log('Insert test error code:', insError.code);
    console.log('Insert test error message:', insError.message);
    if (insError.message.includes('check constraint') || insError.message.includes('invalid input value for enum')) {
      console.log('CRITICAL: "pending" status is NOT allowed by database constraints.');
    }
  } else {
    console.log('Insert test successful (unexpectedly, as IDs were dummy, but means status was OK if only FK failed)');
  }
}

checkSchema();
