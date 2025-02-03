// pages/api/conceptos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const { id } = req.query;
  const conceptoId = Number(id);

  if (isNaN(conceptoId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (req.method === 'PUT') {
    try {
      const { nombre, descripcion, monto, estiloId } = req.body;

      const updateData: any = {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(monto && { monto: Number(monto) })
      };

      // Manejar la conexión con estilo
      if (estiloId !== undefined) {
        if (estiloId === null) {
          updateData.estilo = { disconnect: true };
        } else {
          updateData.estilo = {
            connect: { id: Number(estiloId) }
          };
        }
      }

      const concepto = await prisma.concepto.update({
        where: { id: conceptoId },
        data: updateData,
        include: {
          estilo: {
            include: {
              profesor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });

      res.status(200).json(concepto);
    } catch (error) {
      console.error('Error al actualizar concepto:', error);
      res.status(400).json({ 
        error: 'Error al actualizar concepto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } 
  
  else if (req.method === 'DELETE') {
    try {
      const conceptoExistente = await prisma.concepto.findUnique({
        where: { id: conceptoId },
        include: { deudas: true }
      });

      if (!conceptoExistente) {
        return res.status(404).json({ error: 'Concepto no encontrado' });
      }

      if (conceptoExistente.deudas.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el concepto porque está siendo utilizado en deudas existentes'
        });
      }

      await prisma.concepto.delete({
        where: { id: conceptoId }
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar concepto:', error);
      res.status(400).json({ 
        error: 'Error al eliminar concepto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}