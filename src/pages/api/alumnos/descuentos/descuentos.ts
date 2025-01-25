//src/pages/api/alumnos/descuentos/descuentos.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const descuentos = await prisma.descuento.findMany({
        include: {
          aplicadoA: {
            include: {
              alumno: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.status(200).json(descuentos);
    } catch (error) {
      console.error('Error al obtener descuentos:', error);
      res.status(500).json({ error: 'Error al obtener descuentos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, porcentaje, esAutomatico, minEstilos, alumnoId } = req.body;

      const descuento = await prisma.$transaction(async (prisma) => {
        const nuevoDescuento = await prisma.descuento.create({
          data: {
            nombre,
            porcentaje: parseFloat(porcentaje),
            esAutomatico: Boolean(esAutomatico),
            minEstilos: minEstilos ? parseInt(minEstilos) : null,
            activo: true
          }
        });

        // Si se especifica un alumno, aplicar el descuento inmediatamente
        if (alumnoId) {
          await prisma.descuentoAplicado.create({
            data: {
              alumnoId: parseInt(alumnoId),
              descuentoId: nuevoDescuento.id,
              fechaInicio: new Date(),
              activo: true
            }
          });
        }

        return nuevoDescuento;
      });

      res.status(201).json(descuento);
    } catch (error) {
      console.error('Error al crear descuento:', error);
      res.status(400).json({ error: 'Error al crear descuento' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}