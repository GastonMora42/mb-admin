import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const estilos = await prisma.estilo.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          importe: true,        // Lo mantenemos por compatibilidad
          monto: true,          // Añadimos este
          profesor: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { nombre: 'asc' }
      });
  
      // Asegurarnos de que siempre devolvemos un valor en monto
      const estilosConMonto = estilos.map(estilo => ({
        ...estilo,
        monto: estilo.importe || 0  // Usamos importe como monto
      }));
  
      res.status(200).json(estilosConMonto);
    } catch (error) {
      console.error('Error al obtener estilos:', error);
      res.status(500).json({ error: 'Error al obtener estilos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, descripcion, profesorId, importe } = req.body;
      const importeNumerico = parseFloat(importe);
      
      const estilo = await prisma.estilo.create({
        data: {
          nombre,
          descripcion,
          importe: importeNumerico,
          monto: importeNumerico,     // Agregamos este campo
          profesor: profesorId ? { connect: { id: parseInt(profesorId) } } : undefined
        },
        include: { 
          profesor: true 
        }
      });
      res.status(201).json(estilo);
    } catch (error) {
      console.error('Error al crear estilo:', error);
      res.status(400).json({ error: 'Error al crear estilo' });
    }
  }
};