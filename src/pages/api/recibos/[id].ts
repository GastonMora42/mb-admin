import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const reciboId = parseInt(id as string);
      await prisma.recibo.delete({
        where: { id: reciboId }
      });
      res.status(200).json({ message: 'Recibo eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar recibo:', error);
      res.status(500).json({ error: 'Error al eliminar recibo' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}