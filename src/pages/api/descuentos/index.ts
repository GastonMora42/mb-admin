// pages/api/descuentos.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { activo, esAutomatico } = req.query;
    
    const whereClause: Record<string, unknown> = {};
    if (activo !== undefined) whereClause.activo = activo === 'true';
    if (esAutomatico !== undefined) whereClause.esAutomatico = esAutomatico === 'true';

    try {
      const descuentos = await prisma.descuento.findMany({
        where: whereClause,
        include: {
          aplicadoA: {
            include: {
              alumno: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(descuentos);
    } catch (error) {
      console.error('Error al obtener descuentos:', error);
      res.status(500).json({ error: 'Error al obtener descuentos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, porcentaje, esAutomatico, minEstilos } = req.body;

      const descuento = await prisma.descuento.create({
        data: {
          nombre,
          porcentaje: parseFloat(porcentaje),
          esAutomatico: Boolean(esAutomatico),
          minEstilos: minEstilos ? parseInt(minEstilos) : null,
        }
      });

      res.status(201).json(descuento);
    } catch (error) {
      console.error('Error al crear descuento:', error);
      res.status(400).json({ error: 'Error al crear descuento' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, nombre, porcentaje, activo, esAutomatico, minEstilos } = req.body;

      const descuento = await prisma.descuento.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          porcentaje: parseFloat(porcentaje),
          activo: Boolean(activo),
          esAutomatico: Boolean(esAutomatico),
          minEstilos: minEstilos ? parseInt(minEstilos) : null,
        }
      });

      res.status(200).json(descuento);
    } catch (error) {
      console.error('Error al actualizar descuento:', error);
      res.status(400).json({ error: 'Error al actualizar descuento' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}