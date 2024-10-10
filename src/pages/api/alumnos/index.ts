import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const alumnos = await prisma.alumno.findMany({
        where: { activo : true },
        orderBy: { apellido: 'asc' }
      })
      res.status(200).json(alumnos)
    } catch (error) {
      console.error('Error al obtener alumnos:', error)
      res.status(500).json({ error: 'Error al obtener alumnos!' })
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, apellido, dni, fechaNacimiento, email, telefono } = req.body;
      const alumno = await prisma.alumno.create({
        data: {
          nombre,
          apellido,
          dni,
          fechaNacimiento: new Date(fechaNacimiento),
          email,
          telefono,
          activo: true
        }
      });
      res.status(201).json(alumno);
    } catch (error) {
      console.error('Error al crear alumno:', error);
      res.status(400).json({ error: 'Error al crear alumno' });
    }
  } else if (req.method === 'PATCH') {
    const { id, activo } = req.body
    try {
      const alumno = await prisma.alumno.update({
        where: { id: parseInt(id) },
        data: { activo }
      })
      res.status(200).json(alumno)
    } catch (error) {
      console.error('Error al actualizar alumno:', error)
      res.status(400).json({ error: 'Error al actualizar alumno' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}