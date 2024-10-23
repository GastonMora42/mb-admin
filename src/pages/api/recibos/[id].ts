import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de recibo no proporcionado o inválido' });
    }

    try {
      const reciboId = parseInt(id);
      await prisma.recibo.delete({
        where: { id: reciboId }
      });
      res.status(200).json({ message: 'Recibo eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar recibo:', error);
      res.status(500).json({ error: 'Error al eliminar recibo' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}