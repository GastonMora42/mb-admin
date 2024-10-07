import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const profesores = await prisma.profesor.findMany({
        orderBy: { apellido: 'asc' }
      })
      res.status(200).json(profesores)
    } catch (error) {
      console.error('Error al obtener profesores:', error)
      res.status(500).json({ error: 'Error al obtener profesores' })
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, apellido, dni, email } = req.body
      const profesor = await prisma.profesor.create({
        data: {
          nombre,
          apellido,
          dni,
          email
        }
      })
      res.status(201).json(profesor)
    } catch (error) {
      console.error('Error al crear profesor:', error)
      res.status(400).json({ error: 'Error al crear profesor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}