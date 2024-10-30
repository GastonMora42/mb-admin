// pages/api/registrar-clase.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { profesorId, estiloId, fecha, asistencias, alumnosSueltos } = req.body;

    // Validación de datos de entrada
    if (!profesorId || !estiloId || !fecha || !Array.isArray(asistencias)) {
      return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    // Validar que el profesor existe y puede dar el estilo
    const profesor = await prisma.profesor.findFirst({
      where: {
        id: parseInt(profesorId),
        estilos: {
          some: {
            id: parseInt(estiloId)
          }
        }
      }
    });

    if (!profesor) {
      return res.status(400).json({ 
        error: 'El profesor no existe o no está habilitado para dar este estilo' 
      });
    }

    // Validar que los alumnos están inscritos en el estilo
    if (asistencias.length > 0) {
      const alumnosValidos = await prisma.alumnoEstilos.findMany({
        where: {
          alumnoId: {
            in: asistencias.map(a => a.alumnoId)
          },
          estiloId: parseInt(estiloId),
          activo: true
        }
      });

      if (alumnosValidos.length !== asistencias.length) {
        return res.status(400).json({ 
          error: 'Algunos alumnos no están inscritos en este estilo' 
        });
      }
    }

    const clase = await prisma.$transaction(async (prisma) => {
      const nuevaClase = await prisma.clase.create({
        data: {
          fecha: new Date(fecha),
          profesorId: parseInt(profesorId),
          estiloId: parseInt(estiloId),
        },
        include: {
          profesor: true,
          estilo: true
        }
      });

      // Crear asistencias para alumnos regulares
      if (asistencias.length > 0) {
        await prisma.asistencia.createMany({
          data: asistencias.map((a) => ({
            claseId: nuevaClase.id,
            alumnoId: a.alumnoId,
            asistio: a.asistio,
          })),
        });
      }

      // Crear alumnos sueltos
      if (alumnosSueltos?.length > 0) {
        for (const alumnoSuelto of alumnosSueltos) {
          await prisma.alumnoSuelto.create({
            data: {
              nombre: alumnoSuelto.nombre,
              apellido: alumnoSuelto.apellido,
              dni: alumnoSuelto.dni,
              telefono: alumnoSuelto.telefono,
              email: alumnoSuelto.email,
              clases: {
                connect: { id: nuevaClase.id }
              }
            },
          });
        }
      }

      return nuevaClase;
    });

    res.status(200).json({ 
      message: 'Clase registrada con éxito', 
      clase 
    });
  } catch (error) {
    console.error('Error al registrar la clase:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: `Error al registrar la clase: ${error.message}` 
      });
    } else {
      res.status(500).json({ 
        error: 'Error desconocido al registrar la clase' 
      });
    }
  }
}