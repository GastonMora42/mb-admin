import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { query, alumnoId } = req.query;

    try {
      if (query) {
        // Buscar alumnos (esta parte se mantiene igual)
        const alumnos = await prisma.alumno.findMany({
          where: {
            OR: [
              { nombre: { contains: query as string, mode: 'insensitive' } },
              { apellido: { contains: query as string, mode: 'insensitive' } },
            ],
          },
          take: 10,
        });
        return res.status(200).json(alumnos);
      } else if (alumnoId) {
        // Buscar recibos del alumno (ahora incluimos tipoPago)
        const recibos = await prisma.recibo.findMany({
          where: { alumnoId: parseInt(alumnoId as string) },
          include: {
            alumno: true,
            concepto: true,
          },
          orderBy: { fecha: 'desc' },
        });
        const total = recibos.reduce((sum, recibo) => sum + recibo.monto, 0);
        return res.status(200).json({ recibos, total });
      } else {
        return res.status(400).json({ error: 'Parámetros inválidos' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}