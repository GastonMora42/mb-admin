//src/pages/api/alumnos/descuentos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID no válido' });
  }

  if (req.method === 'PATCH') {
    try {
      const { activo, porcentaje } = req.body;
      
      const descuento = await prisma.descuento.update({
        where: { id: parseInt(id) },
        data: {
          activo: typeof activo === 'boolean' ? activo : undefined,
          porcentaje: porcentaje ? parseFloat(porcentaje) : undefined
        }
      });

      res.status(200).json(descuento);
    } catch (error) {
      console.error('Error al actualizar descuento:', error);
      res.status(400).json({ error: 'Error al actualizar descuento' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}