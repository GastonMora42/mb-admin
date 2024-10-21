import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { generarDeudaMensual } from '@/utils/alumnoUtils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const alumnos = await prisma.alumno.findMany({
        include: { 
          alumnoEstilos: {
            include: {
              estilo: true
            }
          }
        },
        orderBy: { apellido: 'asc' }
      })
      res.status(200).json(alumnos)
    } catch (error) {
      console.error('Error al obtener alumnos:', error)
      res.status(500).json({ error: 'Error al obtener alumnos' })
    }
  }
  if (req.method === 'POST') {
    try {
      const { 
        nombre, apellido, dni, fechaNacimiento, email, telefono, 
        numeroEmergencia, direccion, obraSocial, nombreTutor, dniTutor, 
        notas, estilosIds 
      } = req.body;

      const alumnoSueltoExistente = await prisma.alumnoSuelto.findUnique({
        where: { dni }
      });

      let alumno;

      if (alumnoSueltoExistente) {
        alumno = await prisma.$transaction(async (prisma) => {
          // Crear el nuevo alumno regular
          const nuevoAlumnoRegular = await prisma.alumno.create({
            data: {
              nombre: alumnoSueltoExistente.nombre,
              apellido: alumnoSueltoExistente.apellido,
              dni: alumnoSueltoExistente.dni,
              fechaNacimiento: new Date(fechaNacimiento),
              email: alumnoSueltoExistente.email || email,
              telefono: alumnoSueltoExistente.telefono || telefono,
              numeroEmergencia,
              direccion,
              obraSocial,
              nombreTutor,
              dniTutor,
              notas,
              alumnoEstilos: {
                create: estilosIds.map((id: number) => ({
                  estilo: { connect: { id } },
                  activo: true
                }))
              },
              alumnosSueltosAnteriores: {
                connect: { id: alumnoSueltoExistente.id }
              }
            },
            include: {
              alumnoEstilos: {
                include: {
                  estilo: true
                }
              },
              alumnosSueltosAnteriores: true
            }
          });

          // Actualizar el alumno suelto para vincularlo al nuevo alumno regular
          await prisma.alumnoSuelto.update({
            where: { id: alumnoSueltoExistente.id },
            data: { alumnoRegularId: nuevoAlumnoRegular.id }
          });

          return nuevoAlumnoRegular;
        });
      } else {
        // Crear un nuevo alumno regular normalmente si no existe como alumno suelto
        alumno = await prisma.alumno.create({
          data: {
            nombre,
            apellido,
            dni,
            fechaNacimiento: new Date(fechaNacimiento),
            email,
            telefono,
            numeroEmergencia,
            direccion,
            obraSocial,
            nombreTutor,
            dniTutor,
            notas,
            alumnoEstilos: {
              create: estilosIds.map((id: number) => ({
                estilo: { connect: { id } },
                activo: true
              }))
            }
          },
          include: {
            alumnoEstilos: {
              include: {
                estilo: true
              }
            }
          }
        });
      }

      // Generar deuda mensual para el nuevo alumno
      await generarDeudaMensual(alumno.id);

      res.status(201).json(alumno);
    } catch (error) {
      console.error('Error al crear alumno:', error);
      res.status(400).json({ error: 'Error al crear alumno' });
    }
  }
  else if (req.method === 'PATCH') {
    const { id, activo } = req.body
    try {
      const alumno = await prisma.alumno.update({
        where: { id: parseInt(id) },
        data: { activo },
        include: { 
          alumnoEstilos: {
            include: {
              estilo: true
            }
          }
        }
      })
      res.status(200).json(alumno)
    } catch (error) {
      console.error('Error al actualizar alumno:', error)
      res.status(400).json({ error: 'Error al actualizar alumno' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}