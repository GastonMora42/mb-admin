import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const conceptos = await prisma.concepto.findMany({
        orderBy: { nombre: 'asc' }
      })
      res.status(200).json(conceptos)
    } catch (error) {
      console.error('Error al obtener conceptos:', error)
      res.status(500).json({ error: 'Error al obtener conceptos' })
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, descripcion, monto } = req.body
      const concepto = await prisma.concepto.create({
        data: {
          nombre,
          descripcion,
          monto: parseFloat(monto),
        },
        include: { estilo: true }
      })
      res.status(201).json(concepto)
    } catch (error) {
      console.error('Error al crear concepto:', error)
      res.status(400).json({ error: 'Error al crear concepto' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}