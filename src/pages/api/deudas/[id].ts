// src/pages/api/deudas/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const deudaId = parseInt(id as string);

  if (isNaN(deudaId)) {
    return res.status(400).json({ error: 'ID de deuda inválido' });
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar si la deuda existe
      const deuda = await prisma.deuda.findUnique({
        where: { id: deudaId },
        include: { pagos: true }
      });

      if (!deuda) {
        return res.status(404).json({ error: 'Deuda no encontrada' });
      }

      // Verificar si la deuda ya tiene pagos asociados
      if (deuda.pagos.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar una deuda que ya tiene pagos asociados' 
        });
      }

      // Eliminar la deuda
      await prisma.deuda.delete({
        where: { id: deudaId }
      });

      return res.status(200).json({ message: 'Deuda eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar deuda:', error);
      return res.status(500).json({ 
        error: 'Error al eliminar la deuda',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}