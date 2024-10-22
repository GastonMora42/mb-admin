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

      // Convertir IDs a números y validar
      const parsedAlumnoId = parseInt(alumnoId)
      const parsedEstiloId = parseInt(estiloId)

      if (isNaN(parsedAlumnoId) || isNaN(parsedEstiloId)) {
        return res.status(400).json({ error: 'IDs inválidos' })
      }

      // Verificar que el alumno y el estilo existen
      const [alumnoExists, estiloExists] = await Promise.all([
        prisma.alumno.findUnique({ where: { id: parsedAlumnoId } }),
        prisma.estilo.findUnique({ where: { id: parsedEstiloId } })
      ])

      if (!alumnoExists || !estiloExists) {
        return res.status(404).json({ error: 'Alumno o estilo no encontrado' })
      }

      // Actualizar o crear la relación
      if (activo) {
        await prisma.alumnoEstilos.upsert({
          where: {
            alumnoId_estiloId: {
              alumnoId: parsedAlumnoId,
              estiloId: parsedEstiloId
            }
          },
          update: { 
            activo: true 
          },
          create: {
            alumnoId: parsedAlumnoId,
            estiloId: parsedEstiloId,
            activo: true
          }
        })
      } else {
        // Intentar desactivar solo si existe
        await prisma.alumnoEstilos.updateMany({
          where: {
            alumnoId: parsedAlumnoId,
            estiloId: parsedEstiloId
          },
          data: { 
            activo: false 
          }
        })
      }
      
      // Obtener el alumno actualizado con sus estilos
      const alumnoActualizado = await prisma.alumno.findUnique({
        where: { 
          id: parsedAlumnoId 
        },
        include: { 
          alumnoEstilos: {
            where: {
              activo: true // Solo incluir estilos activos
            },
            include: {
              estilo: {
                select: {
                  id: true,
                  nombre: true,
                  monto: true
                }
              }
            }
          }
        }
      })
      
      // Crear una deuda automática si se está activando un estilo
      if (activo) {
        const currentDate = new Date()
        await prisma.deuda.create({
          data: {
            alumnoId: parsedAlumnoId,
            estiloId: parsedEstiloId,
            monto: estiloExists.monto,
            mes: (currentDate.getMonth() + 1).toString(),
            anio: currentDate.getFullYear(),
            pagada: false
          }
        })
      }

      res.status(200).json({
        success: true,
        alumno: alumnoActualizado,
        message: activo ? 'Estilo activado correctamente' : 'Estilo desactivado correctamente'
      })

    } catch (error) {
      console.error('Error al actualizar estilo del alumno:', error)
      res.status(500).json({ 
        error: 'Error al actualizar estilo del alumno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  } else {
    res.setHeader('Allow', ['PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}