import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

async function testReport() {
  const date = new Date().toISOString();
  try {
    console.log('Intentando conectar a http://localhost:3000/api/generate-report');
    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Respuesta recibida:', result);
  } catch (error) {
    console.error('Error detallado:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

testReport();