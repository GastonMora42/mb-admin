// pages/api/profesores/[id]/estilos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de profesor no válido' });
  }

  try {
    const profesor = await prisma.profesor.findUnique({
      where: { id: parseInt(id) },
      include: {
        estilos: true
      }
    });

    if (!profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    res.status(200).json(profesor.estilos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener estilos del profesor' });
  }
}