// () pages/api/alumnos-por-estilo.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { estiloId } = req.query

      if (!estiloId || Array.isArray(estiloId)) {
        return res.status(400).json({ error: 'estiloId debe ser un valor único' })
      }

      const alumnos = await prisma.alumno.findMany({
        where: {
          estilos: {
            some: {
              id: parseInt(estiloId)
            }
          }
        },
        select: {
          id: true,
          nombre: true,
          apellido: true
        },
        orderBy: { apellido: 'asc' }
      })

      res.status(200).json(alumnos)
    } catch (error) {
      console.error('Error al obtener alumnos por estilo:', error)
      res.status(500).json({ error: 'Error al obtener alumnos por estilo' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}