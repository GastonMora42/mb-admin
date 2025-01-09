import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET
  if (req.method === 'GET') {
    try {
      const alumnos = await prisma.alumno.findMany({
        include: { 
          alumnoEstilos: {
            include: {
              estilo: {
                select: {
                  id: true,
                  nombre: true,
                  monto: true,
                  descripcion: true,
                  importe: true
                }
              }
            }
          },
          descuentosVigentes: {
            where: {
              activo: true
            },
            include: {
              descuento: true
            }
          },
          deudas: {
            include: {
              estilo: true
            }
          }
        },
        orderBy: { apellido: 'asc' }
      });
      return res.status(200).json(alumnos);
    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      return res.status(500).json({ error: 'Error al obtener alumnos' });
    }
  }
  // POST
  if (req.method === 'POST') {
    try {
      const { 
        nombre, apellido, dni, fechaNacimiento, email, telefono, 
        numeroEmergencia, direccion, obraSocial, nombreTutor, dniTutor, 
        notas, estilosIds, descuentoManual 
      } = req.body;

      // Verificaciones iniciales
      const alumnoSueltoExistente = await prisma.alumnoSuelto.findUnique({
        where: { dni }
      });

      const alumnoExistente = await prisma.alumno.findUnique({
        where: { dni }
      });

      if (alumnoExistente) {
        throw new Error('Ya existe un alumno con ese DNI');
      }

      // Obtener los estilos
      const estilos = await prisma.estilo.findMany({
        where: { id: { in: estilosIds } }
      });

      // Una única transacción para todas las operaciones
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear el alumno
        const nuevoAlumno = await tx.alumno.create({
          data: {
            nombre: alumnoSueltoExistente?.nombre || nombre,
            apellido: alumnoSueltoExistente?.apellido || apellido,
            dni,
            fechaNacimiento: new Date(fechaNacimiento),
            email: alumnoSueltoExistente?.email || email,
            telefono: alumnoSueltoExistente?.telefono || telefono,
            numeroEmergencia,
            direccion,
            obraSocial,
            nombreTutor,
            dniTutor,
            notas,
            alumnoEstilos: {
              create: estilosIds.map((id: number) => ({
                estilo: { connect: { id } },
                activo: true,
                fechaInicio: new Date()
              }))
            },
            ...(alumnoSueltoExistente && {
              alumnosSueltosAnteriores: {
                connect: { id: alumnoSueltoExistente.id }
              }
            })
          }
        });

        // Crear cuenta corriente
        await tx.ctaCte.create({
          data: {
            alumnoId: nuevoAlumno.id,
            saldo: 0
          }
        });

        // Generar y crear deudas
// Generar y crear deudas desde el mes actual
const fechaActual = new Date();
const deudasACrear = [];

// Usar el primer día del mes actual como fecha de inicio
const fechaInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
let fechaIteracion = new Date(fechaInicio);

// Solo generamos para el mes actual
while (fechaIteracion <= fechaActual) {
  for (const estilo of estilos) {
    deudasACrear.push({
      alumnoId: nuevoAlumno.id,
      estiloId: estilo.id,
      monto: estilo.importe || 0,
      montoOriginal: estilo.importe || 0,
      mes: (fechaIteracion.getMonth() + 1).toString(),
      anio: fechaIteracion.getFullYear(),
      fechaVencimiento: new Date(
        fechaIteracion.getFullYear(),
        fechaIteracion.getMonth(),
        10  // Vencimiento el día 10 de cada mes
      ),
      pagada: false
    });
  }
  // Solo avanzamos al siguiente mes si la fecha actual es después del día 10
  if (fechaActual.getDate() > 15) {
    fechaIteracion.setMonth(fechaIteracion.getMonth() + 1);
  } else {
    break;
  }
}

await tx.deuda.createMany({ data: deudasACrear });

        // Aplicar descuentos si corresponde
        if (estilosIds.length >= 2) {
          const descuentoAutomatico = await tx.descuento.findFirst({
            where: {
              esAutomatico: true,
              minEstilos: { lte: estilosIds.length },
              activo: true
            },
            orderBy: { porcentaje: 'desc' }
          });

          if (descuentoAutomatico) {
            await tx.descuentoAplicado.create({
              data: {
                alumnoId: nuevoAlumno.id,
                descuentoId: descuentoAutomatico.id,
                fechaInicio: new Date(),
                activo: true
              }
            });
          }
        }

        if (descuentoManual) {
          const descuentoCreado = await tx.descuento.create({
            data: {
              nombre: `Descuento Manual - ${nombre} ${apellido}`,
              porcentaje: descuentoManual,
              esAutomatico: false,
              activo: true
            }
          });

          await tx.descuentoAplicado.create({
            data: {
              alumnoId: nuevoAlumno.id,
              descuentoId: descuentoCreado.id,
              fechaInicio: new Date(),
              activo: true
            }
          });
        }

        // Actualizar alumno suelto si existe
        if (alumnoSueltoExistente) {
          await tx.alumnoSuelto.update({
            where: { id: alumnoSueltoExistente.id },
            data: { alumnoRegularId: nuevoAlumno.id }
          });
        }

        // Retornar alumno completo
        return await tx.alumno.findUnique({
          where: { id: nuevoAlumno.id },
          include: {
            alumnoEstilos: {
              include: { estilo: true }
            },
            alumnosSueltosAnteriores: true,
            deudas: {
              include: { estilo: true }
            },
            descuentosVigentes: {
              where: { activo: true },
              include: { descuento: true }
            }
          }
        });
      });

      return res.status(201).json(resultado);

    } catch (error) {
      console.error('Error al crear alumno:', error);
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error al crear alumno' 
      });
    }
  }
  // PATCH
  else if (req.method === 'PATCH') {
    try {
      const { id, activo, motivoBaja } = req.body;

      // Actualizar alumno en una transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // Actualizar alumno principal
        const alumno = await tx.alumno.update({
          where: { 
            id: parseInt(id) 
          },
          data: { 
            activo,
            ...(activo === false && {
              fechaBaja: new Date(),
              motivoBaja
            }),
            ...(activo === true && {
              fechaBaja: null,
              motivoBaja: null
            })
          },
          include: { 
            alumnoEstilos: {
              include: {
                estilo: {
                  select: {
                    id: true,
                    nombre: true,
                    monto: true,
                    descripcion: true,
                    importe: true
                  }
                }
              }
            },
            descuentosVigentes: {
              where: {
                activo: true
              },
              include: {
                descuento: true
              }
            },
            deudas: {
              include: {
                estilo: true
              }
            }
          }
        });

        // Si se está dando de baja
        if (!activo) {
          // Desactivar estilos
          await tx.alumnoEstilos.updateMany({
            where: { 
              alumnoId: parseInt(id),
              activo: true
            },
            data: { 
              activo: false,
              fechaFin: new Date()
            }
          });

          // Desactivar descuentos vigentes
          await tx.descuentoAplicado.updateMany({
            where: {
              alumnoId: parseInt(id),
              activo: true
            },
            data: {
              activo: false,
              fechaFin: new Date()
            }
          });
        }

        return alumno;
      });

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error al actualizar alumno:', error);
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error al actualizar alumno' 
      });
    }
  }

  // Método no permitido
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}