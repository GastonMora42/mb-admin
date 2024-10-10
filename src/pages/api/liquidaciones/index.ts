import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const conceptos = await prisma.concepto.findMany({
        orderBy: { nombre: 'asc' }
      });
      res.status(200).json(conceptos);
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
      res.status(500).json({ error: 'Error al obtener conceptos' });
    }
  } else if (req.method === 'POST') {
    const { año, periodo, conceptosIds } = req.body;

    try {
      const recibos = await prisma.recibo.findMany({
        where: {
          AND: [
            { periodoPago: { startsWith: año } },
            { periodoPago: { endsWith: periodo } },
            { conceptoId: { in: conceptosIds } }
          ]
        },
        include: {
          alumno: true,
          concepto: true
        },
        orderBy: { fecha: 'asc' }
      });

      res.status(200).json(recibos);
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      res.status(500).json({ error: 'Error al obtener recibos' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}