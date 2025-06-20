// pages/api/profesores/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const profesorId = parseInt(id as string);

  if (isNaN(profesorId)) {
    return res.status(400).json({ error: 'ID de profesor inválido' });
  }

  if (req.method === 'GET') {
    try {
      const profesor = await prisma.profesor.findUnique({
        where: { id: profesorId },
        include: {
          estilos: {
            select: {
              id: true,
              nombre: true,
              importe: true,
              descripcion: true
            }
          },
          clases: {
            take: 10,
            orderBy: { fecha: 'desc' },
            include: {
              estilo: true
            }
          },
          liquidaciones: {
            take: 5,
            orderBy: { fecha: 'desc' }
          }
        }
      });

      if (!profesor) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      res.status(200).json(profesor);
    } catch (error) {
      console.error('Error al obtener profesor:', error);
      res.status(500).json({ error: 'Error al obtener profesor' });
    }
  }
  
  else if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { 
        nombre, 
        apellido, 
        email, 
        telefono,
        fechaNacimiento,
        direccion,
        cuit,
        estilosIds,
        porcentajePorDefecto,
        porcentajeClasesSueltasPorDefecto,
        // Nuevos campos para montos fijos
        montoFijoRegular,
        montoFijoSueltas,
        tipoLiquidacionRegular,
        tipoLiquidacionSueltas,
        activo
      } = req.body;

      // Validaciones
      if (tipoLiquidacionRegular && !['PORCENTAJE', 'MONTO_FIJO'].includes(tipoLiquidacionRegular)) {
        return res.status(400).json({ error: 'Tipo de liquidación regular inválido' });
      }

      if (tipoLiquidacionSueltas && !['PORCENTAJE', 'MONTO_FIJO'].includes(tipoLiquidacionSueltas)) {
        return res.status(400).json({ error: 'Tipo de liquidación sueltas inválido' });
      }

      if (montoFijoRegular !== undefined && (isNaN(montoFijoRegular) || montoFijoRegular < 0)) {
        return res.status(400).json({ error: 'Monto fijo regular debe ser un número mayor o igual a 0' });
      }

      if (montoFijoSueltas !== undefined && (isNaN(montoFijoSueltas) || montoFijoSueltas < 0)) {
        return res.status(400).json({ error: 'Monto fijo sueltas debe ser un número mayor o igual a 0' });
      }

      // Obtener estilos actuales del profesor si se van a modificar
      let profesorActual = null;
      if (estilosIds !== undefined) {
        profesorActual = await prisma.profesor.findUnique({
          where: { id: profesorId },
          include: { estilos: true }
        });

        if (!profesorActual) {
          return res.status(404).json({ error: 'Profesor no encontrado' });
        }
      }

      // Construir objeto de actualización
      const updateData: any = {};

      // Campos básicos
      if (nombre !== undefined) updateData.nombre = nombre;
      if (apellido !== undefined) updateData.apellido = apellido;
      if (email !== undefined) updateData.email = email;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (fechaNacimiento !== undefined) updateData.fechaNacimiento = new Date(fechaNacimiento);
      if (direccion !== undefined) updateData.direccion = direccion;
      if (cuit !== undefined) updateData.cuit = cuit;
      if (activo !== undefined) updateData.activo = Boolean(activo);

      // Configuración de liquidación por porcentajes
      if (porcentajePorDefecto !== undefined) {
        updateData.porcentajePorDefecto = parseFloat(porcentajePorDefecto);
      }
      if (porcentajeClasesSueltasPorDefecto !== undefined) {
        updateData.porcentajeClasesSueltasPorDefecto = parseFloat(porcentajeClasesSueltasPorDefecto);
      }

      // Nuevos campos para montos fijos
      if (montoFijoRegular !== undefined) {
        updateData.montoFijoRegular = parseFloat(montoFijoRegular);
      }
      if (montoFijoSueltas !== undefined) {
        updateData.montoFijoSueltas = parseFloat(montoFijoSueltas);
      }
      if (tipoLiquidacionRegular !== undefined) {
        updateData.tipoLiquidacionRegular = tipoLiquidacionRegular;
      }
      if (tipoLiquidacionSueltas !== undefined) {
        updateData.tipoLiquidacionSueltas = tipoLiquidacionSueltas;
      }

      // Manejar actualización de estilos si se proporcionaron
      if (estilosIds !== undefined && profesorActual) {
        updateData.estilos = {
          disconnect: profesorActual.estilos.map((e: { id: any; }) => ({ id: e.id })),
          connect: estilosIds ? estilosIds.map((id: number) => ({ id })) : []
        };
      }

      // Actualizar profesor
      const profesor = await prisma.profesor.update({
        where: { id: profesorId },
        data: updateData,
        include: {
          estilos: {
            select: {
              id: true,
              nombre: true,
              importe: true,
              descripcion: true
            }
          },
          clases: {
            take: 5,
            orderBy: { fecha: 'desc' }
          },
          liquidaciones: {
            take: 3,
            orderBy: { fecha: 'desc' }
          }
        }
      });

      res.status(200).json(profesor);
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      res.status(400).json({ 
        error: 'Error al actualizar profesor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  else if (req.method === 'DELETE') {
    try {
      // Verificar si el profesor tiene clases o liquidaciones
      const profesor = await prisma.profesor.findUnique({
        where: { id: profesorId },
        include: {
          clases: true,
          liquidaciones: true,
          estilos: true
        }
      });

      if (!profesor) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      if (profesor.clases.length > 0 || profesor.liquidaciones.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el profesor porque tiene clases o liquidaciones asociadas',
          details: {
            clases: profesor.clases.length,
            liquidaciones: profesor.liquidaciones.length
          }
        });
      }

      // Eliminar el profesor usando transacción
      await prisma.$transaction([
        // Desconectar todos los estilos
        prisma.profesor.update({
          where: { id: profesorId },
          data: {
            estilos: {
              disconnect: profesor.estilos.map((e: { id: any; }) => ({ id: e.id }))
            }
          }
        }),
        // Eliminar el profesor
        prisma.profesor.delete({
          where: { id: profesorId }
        })
      ]);

      res.status(200).json({ 
        message: 'Profesor eliminado exitosamente',
        id: profesorId
      });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      res.status(500).json({ 
        error: 'Error al eliminar profesor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'PATCH', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}