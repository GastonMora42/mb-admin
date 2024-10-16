import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { alumnoId, estiloId, activo } = req.body
    try {
      if (activo) {
        // Activar el estilo para el alumno
        await prisma.alumnoEstilos.upsert({
          where: {
            alumnoId_estiloId: {
              alumnoId: parseInt(alumnoId),
              estiloId: parseInt(estiloId)
            }
          },
          update: { activo: true },
          create: {
            alumnoId: parseInt(alumnoId),
            estiloId: parseInt(estiloId),
            activo: true
          }
        })
      } else {
        // Desactivar el estilo para el alumno
        await prisma.alumnoEstilos.update({
          where: {
            alumnoId_estiloId: {
              alumnoId: parseInt(alumnoId),
              estiloId: parseInt(estiloId)
            }
          },
          data: { activo: false }
        })
      }
      
      const alumno = await prisma.alumno.findUnique({
        where: { id: parseInt(alumnoId) },
        include: { 
          alumnoEstilos: {
            include: {
              estilo: true
            }
          }
        }
      })
      
      res.status(200).json(alumno)
    } catch (error) {
      console.error('Error al actualizar estilo del alumno:', error)
      res.status(400).json({ error: 'Error al actualizar estilo del alumno' })
    }
  } else {
    res.setHeader('Allow', ['PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}