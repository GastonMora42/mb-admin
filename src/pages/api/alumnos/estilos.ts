//src/pages/api/alumnos/estilos.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { alumnoId, estiloId, activo } = req.body
    
    try {
      // Validación de datos
      if (!alumnoId || !estiloId) {
        return res.status(400).json({ error: 'alumnoId y estiloId son requeridos' })
      }

      const parsedAlumnoId = parseInt(alumnoId)
      const parsedEstiloId = parseInt(estiloId)

      if (isNaN(parsedAlumnoId) || isNaN(parsedEstiloId)) {
        return res.status(400).json({ error: 'IDs inválidos' })
      }

      await prisma.$transaction(async (prisma) => {
        // Actualizar o crear la relación estilo-alumno
        if (activo) {
          await prisma.alumnoEstilos.upsert({
            where: {
              alumnoId_estiloId: {
                alumnoId: parsedAlumnoId,
                estiloId: parsedEstiloId
              }
            },
            update: { 
              activo: true,
              fechaInicio: new Date() 
            },
            create: {
              alumnoId: parsedAlumnoId,
              estiloId: parsedEstiloId,
              activo: true,
              fechaInicio: new Date()
            }
          });

          // Crear deuda para el nuevo estilo
          const estilo = await prisma.estilo.findUnique({
            where: { id: parsedEstiloId }
          });

          if (estilo) {
            const currentDate = new Date();
            await prisma.deuda.create({
              data: {
                alumnoId: parsedAlumnoId,
                estiloId: parsedEstiloId,
                monto: estilo.monto,
                montoOriginal: estilo.monto,
                mes: (currentDate.getMonth() + 1).toString(),
                anio: currentDate.getFullYear(),
                fechaVencimiento: new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  10
                ),
                pagada: false
              }
            });
          }
        } else {
          await prisma.alumnoEstilos.updateMany({
            where: {
              alumnoId: parsedAlumnoId,
              estiloId: parsedEstiloId
            },
            data: { 
              activo: false,
              fechaFin: new Date()
            }
          });
        }

        // Recalcular descuentos automáticos
        const estilosActivos = await prisma.alumnoEstilos.count({
          where: {
            alumnoId: parsedAlumnoId,
            activo: true
          }
        });

        // Desactivar descuentos automáticos anteriores
        await prisma.descuentoAplicado.updateMany({
          where: {
            alumnoId: parsedAlumnoId,
            descuento: {
              esAutomatico: true
            },
            activo: true
          },
          data: {
            activo: false,
            fechaFin: new Date()
          }
        });

        // Aplicar nuevo descuento automático si corresponde
        if (estilosActivos >= 2) {
          const descuentoAutomatico = await prisma.descuento.findFirst({
            where: {
              esAutomatico: true,
              minEstilos: {
                lte: estilosActivos
              },
              activo: true
            },
            orderBy: {
              porcentaje: 'desc'
            }
          });

          if (descuentoAutomatico) {
            await prisma.descuentoAplicado.create({
              data: {
                alumnoId: parsedAlumnoId,
                descuentoId: descuentoAutomatico.id,
                fechaInicio: new Date(),
                activo: true
              }
            });
          }
        }
      });

      // Obtener alumno actualizado con toda su información
      const alumnoActualizado = await prisma.alumno.findUnique({
        where: { id: parsedAlumnoId },
        include: { 
          alumnoEstilos: {
            include: {
              estilo: true
            }
          },
          descuentosVigentes: {
            where: {
              activo: true
            },
            include: {
              descuento: true
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        alumno: alumnoActualizado,
        message: activo ? 'Estilo activado correctamente' : 'Estilo desactivado correctamente'
      });

    } catch (error) {
      console.error('Error al actualizar estilo del alumno:', error);
      res.status(500).json({ 
        error: 'Error al actualizar estilo del alumno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}