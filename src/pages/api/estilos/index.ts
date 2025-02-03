// pages/api/estilos/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const estilos = await prisma.estilo.findMany({
        include: {
          profesor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      });

      res.status(200).json(estilos);
    } catch (error) {
      console.error('Error al obtener estilos:', error);
      res.status(500).json({ error: 'Error al obtener estilos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, descripcion, profesorId, importe } = req.body;
      
      const estilo = await prisma.estilo.create({
        data: {
          nombre,
          descripcion,
          importe: Number(importe),
          profesor: profesorId ? {
            connect: {
              id: Number(profesorId),
            },
          } : undefined,
        },
        include: {
          profesor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      res.status(201).json(estilo);
    } catch (error) {
      console.error('Error al crear estilo:', error);
      res.status(400).json({ error: 'Error al crear estilo' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
