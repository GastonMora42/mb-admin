import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const estilos = await prisma.estilo.findMany();
      res.status(200).json(estilos);
    } catch (error) {
      console.error('Error al obtener estilos:', error);
      res.status(500).json({ error: 'Error al obtener estilos' });
    }
  } else if (req.method === 'POST') {
    const { año, periodo, estilosIds } = req.body;

    try {
      const recibos = await prisma.recibo.findMany({
        where: {
          AND: [
            { periodoPago: { startsWith: año } },
            { periodoPago: { endsWith: periodo } },
            { concepto: { estiloId: { in: estilosIds } } }
          ]
        },
        include: {
          alumno: true,
          concepto: {
            include: {
              estilo: true
            }
          }
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