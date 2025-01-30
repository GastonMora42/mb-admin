//api/profesores/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const profesores = await prisma.profesor.findMany({
        include: {
          estilos: {
            select: {
              id: true,
              nombre: true,
              importe: true,
              descripcion: true
            }
          },
          clases: true,
          liquidaciones: true
        },
        orderBy: { apellido: 'asc' }
      });
      res.status(200).json(profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({ error: 'Error al obtener profesores' });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const { 
        nombre, 
        apellido, 
        dni, 
        email, 
        telefono,
        fechaNacimiento,
        direccion,
        cuit,
        estilosIds, // Array de IDs de estilos que dicta
        porcentajePorDefecto,
        porcentajeClasesSueltasPorDefecto
      } = req.body;

      // Verificar que el DNI no esté duplicado
      const profesorExistente = await prisma.profesor.findUnique({
        where: { dni }
      });

      if (profesorExistente) {
        return res.status(400).json({ error: 'Ya existe un profesor con ese DNI' });
      }

      const profesor = await prisma.profesor.create({
        data: {
          nombre,
          apellido,
          dni,
          email,
          telefono,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          direccion,
          cuit,
          porcentajePorDefecto: porcentajePorDefecto ? parseFloat(porcentajePorDefecto) : 0.60,
          porcentajeClasesSueltasPorDefecto: porcentajeClasesSueltasPorDefecto ? 
            parseFloat(porcentajeClasesSueltasPorDefecto) : 0.80,
          estilos: estilosIds ? {
            connect: estilosIds.map((id: number) => ({ id }))
          } : undefined
        },
        include: {
          estilos: true
        }
      });

      res.status(201).json(profesor);
    } catch (error) {
      console.error('Error al crear profesor:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error al crear profesor' 
      });
    }
  }
  
  else if (req.method === 'PATCH') {
    try {
      const { 
        id,
        nombre, 
        apellido, 
        email, 
        telefono,
        fechaNacimiento,
        direccion,
        cuit,
        estilosIds,
        porcentajePorDefecto,
        porcentajeClasesSueltasPorDefecto
      } = req.body;

      // Obtener estilos actuales del profesor
      const profesorActual = await prisma.profesor.findUnique({
        where: { id: parseInt(id) },
        include: { estilos: true }
      });

      if (!profesorActual) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // Actualizar profesor
      const profesor = await prisma.profesor.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          apellido,
          email,
          telefono,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          direccion,
          cuit,
          porcentajePorDefecto: porcentajePorDefecto ? parseFloat(porcentajePorDefecto) : undefined,
          porcentajeClasesSueltasPorDefecto: porcentajeClasesSueltasPorDefecto ? 
            parseFloat(porcentajeClasesSueltasPorDefecto) : undefined,
          estilos: {
            disconnect: profesorActual.estilos.map(e => ({ id: e.id })),
            connect: estilosIds ? estilosIds.map((id: number) => ({ id })) : []
          }
        },
        include: {
          estilos: true,
          clases: true,
          liquidaciones: true
        }
      });

      res.status(200).json(profesor);
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      res.status(400).json({ error: 'Error al actualizar profesor' });
    }
  }
  
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID de profesor no proporcionado' });
      }

      // Verificar si el profesor tiene clases o liquidaciones
      const profesor = await prisma.profesor.findUnique({
        where: { id: parseInt(id) },
        include: {
          clases: true,
          liquidaciones: true,
          estilos: true
        }
      });

      if (!profesor) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      if (profesor.clases.length > 0 || profesor.liquidaciones.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el profesor porque tiene clases o liquidaciones asociadas'
        });
      }

      // Eliminar el profesor
      await prisma.$transaction([
        // Desconectar todos los estilos
        prisma.profesor.update({
          where: { id: parseInt(id) },
          data: {
            estilos: {
              disconnect: profesor.estilos.map(e => ({ id: e.id }))
            }
          }
        }),
        // Eliminar el profesor
        prisma.profesor.delete({
          where: { id: parseInt(id) }
        })
      ]);

      res.status(200).json({ message: 'Profesor eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      res.status(500).json({ error: 'Error al eliminar profesor' });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}