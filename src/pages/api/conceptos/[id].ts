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
      const { 
        nombre, 
        descripcion, 
        montoRegular, 
        montoSuelto, 
        estiloId, 
        esInscripcion,
        activo 
      } = req.body;

      // Validar que los montos sean números válidos
      if ((montoRegular && isNaN(Number(montoRegular))) || 
          (montoSuelto && isNaN(Number(montoSuelto)))) {
        return res.status(400).json({ error: 'Los montos deben ser valores numéricos válidos' });
      }

      // Construir objeto de actualización
      const updateData: any = {
        ...(nombre !== undefined && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(montoRegular !== undefined && { montoRegular: Number(montoRegular) }),
        ...(montoSuelto !== undefined && { montoSuelto: Number(montoSuelto) }),
        ...(esInscripcion !== undefined && { esInscripcion: Boolean(esInscripcion) }),
        ...(activo !== undefined && { activo: Boolean(activo) })
      };

      // Manejar la conexión con estilo
      if (estiloId !== undefined) {
        if (estiloId === null || estiloId === '') {
          updateData.estilo = { disconnect: true };
        } else {
          updateData.estilo = {
            connect: { id: Number(estiloId) }
          };
        }
      }

      // Obtener concepto actual para validaciones
      const conceptoActual = await prisma.concepto.findUnique({
        where: { id: conceptoId },
        include: { deudas: true }
      });

      if (!conceptoActual) {
        return res.status(404).json({ error: 'Concepto no encontrado' });
      }

      // Validar cambios en esInscripcion si hay deudas
      if (esInscripcion !== undefined && 
          esInscripcion !== conceptoActual.esInscripcion && 
          conceptoActual.deudas.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede cambiar el tipo de inscripción porque el concepto tiene deudas asociadas'
        });
      }

      // Actualizar concepto
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
  
  else if (req.method === 'GET') {
    try {
      const concepto = await prisma.concepto.findUnique({
        where: { id: conceptoId },
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

      if (!concepto) {
        return res.status(404).json({ error: 'Concepto no encontrado' });
      }

      res.status(200).json(concepto);
    } catch (error) {
      console.error('Error al obtener concepto:', error);
      res.status(500).json({ error: 'Error al obtener concepto' });
    }
  }
  
  else if (req.method === 'DELETE') {
    try {
      const conceptoExistente = await prisma.concepto.findUnique({
        where: { id: conceptoId },
        include: { 
          deudas: true,
          recibos: true
        }
      });

      if (!conceptoExistente) {
        return res.status(404).json({ error: 'Concepto no encontrado' });
      }

      // Verificar si el concepto está siendo utilizado
      if (conceptoExistente.deudas.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el concepto porque está siendo utilizado en deudas existentes'
        });
      }

      if (conceptoExistente.recibos.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el concepto porque está siendo utilizado en recibos existentes'
        });
      }

      if (conceptoExistente.esInscripcion) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el concepto porque está siendo utilizado en inscripciones existentes'
        });
      }

// Si es el único concepto de inscripción activo, no permitir eliminación
if (conceptoExistente.esInscripcion) {
  const otrosConceptosInscripcion = await prisma.concepto.count({
    where: {
      esInscripcion: true,
      id: { not: conceptoId }
    }
  });

        if (otrosConceptosInscripcion === 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar el único concepto de inscripción activo'
          });
        }
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
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}