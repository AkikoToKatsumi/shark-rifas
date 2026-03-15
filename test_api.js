
const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/raffles');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
