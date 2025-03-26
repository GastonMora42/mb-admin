//src/pages/api/alumnos/estilos.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { TipoModalidad } from '@prisma/client'

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
        // Obtener la modalidad REGULAR para el estilo
        const modalidadRegular = await prisma.modalidadClase.findFirst({
          where: {
            estiloId: parsedEstiloId,
            tipo: TipoModalidad.REGULAR
          }
        });

        if (!modalidadRegular && activo) {
          throw new Error(`No existe configuración de modalidad REGULAR para el estilo ID ${parsedEstiloId}`);
        }

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
              modalidadId: modalidadRegular!.id, // Usamos la modalidad REGULAR por defecto
              activo: true,
              fechaInicio: new Date()
            }
          });

          // Obtener el concepto para este estilo (no inscripción)
          const concepto = await prisma.concepto.findFirst({
            where: { 
              estiloId: parsedEstiloId,
              esInscripcion: false
            }
          });

          if (!concepto) {
            throw new Error(`No existe concepto para el estilo ID ${parsedEstiloId}`);
          }

          // Crear deuda para el nuevo estilo como REGULAR
          const estilo = await prisma.estilo.findUnique({
            where: { id: parsedEstiloId }
          });

          if (estilo) {
            const currentDate = new Date();
            
            // Usamos el montoRegular del concepto
            await prisma.deuda.create({
              data: {
                alumnoId: parsedAlumnoId,
                estiloId: parsedEstiloId,
                conceptoId: concepto.id,
                monto: concepto.montoRegular ?? 0, // Si es null, usa 0
                mes: (currentDate.getMonth() + 1).toString(),
                anio: currentDate.getFullYear(),
                fechaVencimiento: new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  10
                ),
                tipoDeuda: TipoModalidad.REGULAR, // Especificar tipo de modalidad
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
              estilo: true,
              modalidad: true // Incluimos la información de modalidad
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