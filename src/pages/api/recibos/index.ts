import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { numero, alumnoId, conceptoId, periodo, fueraDeTermino } = req.query;
    
    let whereClause: any = {};
    if (numero) whereClause.numeroRecibo = parseInt(numero as string);
    if (alumnoId) whereClause.alumnoId = parseInt(alumnoId as string);
    if (conceptoId) whereClause.conceptoId = parseInt(conceptoId as string);
    if (periodo) whereClause.periodoPago = periodo as string;
    if (fueraDeTermino) whereClause.fueraDeTermino = fueraDeTermino === 'true';

    try {
      const recibos = await prisma.recibo.findMany({
        where: whereClause,
        include: { alumno: true, concepto: true },
        orderBy: { fecha: 'desc' }
      });
      res.status(200).json(recibos);
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      res.status(500).json({ error: 'Error al obtener recibos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { monto, periodoPago, tipoPago, alumnoId, conceptoId, fueraDeTermino } = req.body;
      console.log('Recibido en API:', req.body); // Para depuración
      const recibo = await prisma.recibo.create({
        data: {
          monto: parseFloat(monto),
          periodoPago,
          tipoPago,
          fueraDeTermino: Boolean(fueraDeTermino), // Asegúrate de convertir a booleano
          alumno: { connect: { id: parseInt(alumnoId) } },
          concepto: { connect: { id: parseInt(conceptoId) } }
        },
        include: { alumno: true, concepto: true }
      });
      res.status(201).json(recibo);
    } catch (error) {
      console.error('Error al crear recibo:', error);
      res.status(400).json({ error: 'Error al crear recibo' });
    }
  } else if (req.method === 'DELETE') {
    // ... (código de eliminación sin cambios)
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}