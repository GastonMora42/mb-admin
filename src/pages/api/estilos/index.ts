// pages/api/estilos/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { TipoModalidad } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const estilos = await prisma.estilo.findMany({
        include: {
          profesor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          ModalidadClase: true, // Incluir las modalidades en la respuesta
        },
        orderBy: {
          nombre: 'asc',
        },
      });

      res.status(200).json(estilos);
    } catch (error) {
      console.error('Error al obtener estilos:', error);
      res.status(500).json({ error: 'Error al obtener estilos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, descripcion, profesorId, importe } = req.body;
      
      // Usar transacción para crear estilo y modalidades juntos
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear el estilo primero
        const estilo = await tx.estilo.create({
          data: {
            nombre,
            descripcion,
            importe: Number(importe),
            profesor: profesorId ? {
              connect: {
                id: Number(profesorId),
              },
            } : undefined,
          },
        });
        
        // Crear modalidad REGULAR
        const modalidadRegular = await tx.modalidadClase.create({
          data: {
            tipo: TipoModalidad.REGULAR,
            porcentaje: 0.60, // Porcentaje por defecto para regular
            estiloId: estilo.id,
          }
        });
        
        // Crear modalidad SUELTA
        const modalidadSuelta = await tx.modalidadClase.create({
          data: {
            tipo: TipoModalidad.SUELTA,
            porcentaje: 0.80, // Porcentaje por defecto para suelta
            estiloId: estilo.id,
          }
        });
        
        // Retornar estilo completo con modalidades y profesor
        return await tx.estilo.findUnique({
          where: { id: estilo.id },
          include: {
            profesor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
            ModalidadClase: true,
          },
        });
      });

      res.status(201).json(resultado);
    } catch (error) {
      console.error('Error al crear estilo:', error);
      res.status(400).json({ error: 'Error al crear estilo' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}