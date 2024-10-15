// pages/api/generate-monthly-report.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateMonthlyReport } from '@/utils/generate-monthly-report';
import { sendEmail } from '@/utils/send-email';
import dotenv from 'dotenv';
dotenv.config();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    try {
      console.log('Recibida solicitud para generar reporte mensual');
      const { year, month } = req.body;
      console.log(`Generando reporte para ${year}-${month}`);
  
      const reportHtml = await generateMonthlyReport(year, month);
      console.log('Reporte HTML generado');
  
      const subject = `Reporte Mensual MB: ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
      console.log('Enviando email');
  
      await sendEmail(process.env.SES_RECIPIENT_EMAIL!, subject, reportHtml);
      console.log('Email enviado exitosamente');
  
      res.status(200).json({ message: 'Monthly report generated and sent successfully' });
    } catch (error) {
      console.error('Error detallado:', error);
    }
  }