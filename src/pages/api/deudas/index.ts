import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { alumnoId, pagada } = req.query;
    
    try {
      const deudas = await prisma.deuda.findMany({
        where: {
          alumnoId: alumnoId ? parseInt(alumnoId as string) : undefined,
          pagada: pagada ? pagada === 'true' : undefined,
        },
        include: {
          estilo: true,
          pagos: true
        },
        orderBy: [
          { anio: 'desc' },
          { mes: 'desc' }
        ]
      });

      res.status(200).json(deudas);
    } catch (error) {
      console.error('Error fetching deudas:', error);
      res.status(500).json({ error: 'Error al obtener deudas' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}