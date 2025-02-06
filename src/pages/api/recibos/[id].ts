import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID no válido' });
  }

  if (req.method === 'GET') {
    try {
      const recibo = await prisma.recibo.findUnique({
        where: { id: parseInt(id) },
        include: {
          alumno: true,
          alumnoSuelto: true,
          concepto: {
            include: {
              estilo: true
            }
          },
          clase: {
            include: {
              profesor: true,
              estilo: true
            }
          },
          pagosDeuda: {
            include: {
              deuda: {
                include: {
                  estilo: true,
                  concepto: true
                }
              }
            }
          }
        }
      });

      if (!recibo) {
        return res.status(404).json({ error: 'Recibo no encontrado' });
      }

      res.status(200).json(recibo);
    } catch (error) {
      console.error('Error al obtener recibo:', error);
      res.status(500).json({ error: 'Error al obtener recibo' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const recibo = await prisma.recibo.update({
        where: { id: parseInt(id) },
        data: {
          anulado: true,
          motivoAnulacion: req.body.motivoAnulacion || 'Anulado por el usuario'
        }
      });

      res.status(200).json(recibo);
    } catch (error) {
      console.error('Error anulando recibo:', error);
      res.status(500).json({ error: 'Error al anular recibo' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.$transaction(async (tx) => {
        // Primero eliminar los pagos de deuda relacionados
        await tx.pagoDeuda.deleteMany({
          where: { reciboId: parseInt(id) }
        });
        
        // Luego eliminar el recibo
        await tx.recibo.delete({
          where: { id: parseInt(id) }
        });
      });
      
      res.status(200).json({ message: 'Recibo eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando recibo:', error);
      res.status(500).json({ error: 'Error al eliminar recibo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}