import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { fechaInicio, fechaFin, numeroRecibo, alumnoId, conceptoId, periodoPago, fueraDeTermino, tipoPago } = req.query;

    try {
      let whereClause: any = {};

      if (fechaInicio && fechaFin) {
        whereClause.fecha = {
          gte: new Date(fechaInicio as string),
          lte: new Date(fechaFin as string + 'T23:59:59.999Z'),
        };
      } else {
        // Si no se proporcionan fechas, usa la fecha actual
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        whereClause.fecha = {
          gte: hoy,
          lte: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
        };
      }

      if (numeroRecibo) whereClause.numeroRecibo = parseInt(numeroRecibo as string);
      if (alumnoId) whereClause.alumnoId = parseInt(alumnoId as string);
      if (conceptoId) whereClause.conceptoId = parseInt(conceptoId as string);
      if (periodoPago) whereClause.periodoPago = periodoPago as string;
      if (fueraDeTermino) whereClause.fueraDeTermino = fueraDeTermino === 'true';
      if (tipoPago) whereClause.tipoPago = tipoPago as string;

      const recibos = await prisma.recibo.findMany({
        where: whereClause,
        include: {
          alumno: true,
          concepto: true
        },
        orderBy: { fecha: 'desc' }
      });

      const totalMonto = recibos.reduce((sum, recibo) => sum + recibo.monto, 0);

      const totalPorTipoPago = recibos.reduce((acc, recibo) => {
        acc[recibo.tipoPago] = (acc[recibo.tipoPago] || 0) + recibo.monto;
        return acc;
      }, {} as Record<string, number>);

      res.status(200).json({ recibos, totalMonto, totalPorTipoPago });
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      res.status(500).json({ error: 'Error al obtener recibos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}