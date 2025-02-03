
// pages/api/estilos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const estiloId = Number(id);

  if (isNaN(estiloId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (req.method === 'PUT') {
    try {
      const { nombre, descripcion, profesorId, importe } = req.body;

      const estilo = await prisma.estilo.update({
        where: {
          id: estiloId,
        },
        data: {
          nombre,
          descripcion,
          importe: Number(importe),
          profesor: profesorId ? {
            connect: {
              id: Number(profesorId),
            },
          } : {
            disconnect: true,
          },
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

      res.status(200).json(estilo);
    } catch (error) {
      console.error('Error al actualizar estilo:', error);
      res.status(400).json({ error: 'Error al actualizar estilo' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verificar si el estilo existe
      const estiloExistente = await prisma.estilo.findUnique({
        where: {
          id: estiloId,
        },
      });

      if (!estiloExistente) {
        return res.status(404).json({ error: 'Estilo no encontrado' });
      }

      // Verificar si tiene deudas asociadas
      const tieneDeudas = await prisma.deuda.findFirst({
        where: {
          estiloId: estiloId,
        },
      });

      if (tieneDeudas) {
        return res.status(400).json({
          error: 'No se puede eliminar el estilo porque tiene deudas asociadas',
        });
      }

      // Si no tiene deudas, proceder con la eliminación
      await prisma.estilo.delete({
        where: {
          id: estiloId,
        },
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar estilo:', error);
      res.status(400).json({ error: 'Error al eliminar estilo' });
    }
  } else if (req.method === 'GET') {
    try {
      const estilo = await prisma.estilo.findUnique({
        where: {
          id: estiloId,
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

      if (!estilo) {
        return res.status(404).json({ error: 'Estilo no encontrado' });
      }

      res.status(200).json(estilo);
    } catch (error) {
      console.error('Error al obtener estilo:', error);
      res.status(500).json({ error: 'Error al obtener estilo' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}