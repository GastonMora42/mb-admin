import { NextApiRequest, NextApiResponse } from 'next';
import { generateDailyReport } from '@/utils/generate-report';
import { sendEmail } from '@/utils/send-email';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { date } = req.body;
    const reportDate = new Date(date);

    const reportHtml = await generateDailyReport(reportDate);
    const subject = `Reporte Diario: ${reportDate.toLocaleDateString()}`;

    await sendEmail(process.env.SES_RECIPIENT_EMAIL!, subject, reportHtml);

    res.status(200).json({ message: 'Report generated and sent successfully' });
  } catch (error) {
    console.error('Error generating or sending report:', error);
    res.status(500).json({ message: 'Error generating or sending report' });
  }
}