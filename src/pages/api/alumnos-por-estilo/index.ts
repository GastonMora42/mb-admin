// pages/api/alumnos-por-estilo.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { estiloId } = req.query;

  if (!estiloId) {
    return res.status(400).json({ error: 'ID de estilo requerido' });
  }

  
  try {
    const alumnos = await prisma.alumno.findMany({
      where: {
        alumnoEstilos: {
          some: {
            estiloId: parseInt(estiloId as string),
            activo: true
          }
        },
        activo: true
      },
      include: {
        alumnoEstilos: {
          where: {
            estiloId: parseInt(estiloId as string),
            activo: true
          },
          include: {
            estilo: true
          }
        }
      }
    });

    res.status(200).json(alumnos);
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
}