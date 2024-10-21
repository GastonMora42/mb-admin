// pages/api/alumnos-sueltos.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const alumnosSueltos = await prisma.alumnoSuelto.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(alumnosSueltos);
    } catch (error) {
      console.error('Error al obtener alumnos sueltos:', error);
      res.status(500).json({ error: 'Error al obtener alumnos sueltos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}