import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

async function testMonthlyReport() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  try {
    console.log(`Generando reporte mensual para ${year}-${month}`);
    const response = await fetch('http://localhost:3000/api/generate-monthly-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ year, month }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testMonthlyReport();