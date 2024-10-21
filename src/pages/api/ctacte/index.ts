import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { query, alumnoId } = req.query;

    try {
      if (query) {
        // Buscar alumnos regulares y sueltos
        const alumnos = await prisma.alumno.findMany({
          where: {
            OR: [
              { nombre: { contains: query as string, mode: 'insensitive' } },
              { apellido: { contains: query as string, mode: 'insensitive' } },
            ],
          },
          take: 10,
        });

        const alumnosSueltos = await prisma.alumnoSuelto.findMany({
          where: {
            OR: [
              { nombre: { contains: query as string, mode: 'insensitive' } },
              { apellido: { contains: query as string, mode: 'insensitive' } },
            ],
            alumnoRegularId: null, // Solo incluir los que no se han convertido en regulares
          },
          take: 10,
        });

        return res.status(200).json([...alumnos, ...alumnosSueltos]);
      } else if (alumnoId) {
        // Buscar recibos del alumno (tanto como regular como suelto)
        const recibosRegulares = await prisma.recibo.findMany({
          where: { alumnoId: parseInt(alumnoId as string) },
          include: {
            alumno: true,
            concepto: true,
          },
          orderBy: { fecha: 'desc' },
        });

        const recibosSueltos = await prisma.recibo.findMany({
          where: { 
            OR: [
              { alumnoSueltoId: parseInt(alumnoId as string) },
              { alumnoSuelto: { alumnoRegularId: parseInt(alumnoId as string) } }
            ]
          },
          include: {
            alumnoSuelto: true,
            concepto: true,
          },
          orderBy: { fecha: 'desc' },
        });

        const todosLosRecibos = [...recibosRegulares, ...recibosSueltos].sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        const total = todosLosRecibos.reduce((sum, recibo) => sum + recibo.monto, 0);
        return res.status(200).json({ recibos: todosLosRecibos, total });
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