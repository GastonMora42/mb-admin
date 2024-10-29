import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      res.status(200).json(alumnos);
    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      res.status(500).json({ error: 'Error al obtener alumnos' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { 
        nombre, apellido, dni, fechaNacimiento, email, telefono, 
        numeroEmergencia, direccion, obraSocial, nombreTutor, dniTutor, 
        notas, estilosIds, descuentoManual 
      } = req.body;
  
      // Primero, verificamos el alumno suelto y el existente fuera de la transacción
      const alumnoSueltoExistente = await prisma.alumnoSuelto.findUnique({
        where: { dni }
      });
  
      const alumnoExistente = await prisma.alumno.findUnique({
        where: { dni }
      });
  
      if (alumnoExistente) {
        throw new Error('Ya existe un alumno con ese DNI');
      }
  
      // Obtenemos los estilos antes de la transacción
      const estilos = await prisma.estilo.findMany({
        where: {
          id: {
            in: estilosIds
          }
        }
      });
  
      const alumno = await prisma.$transaction(async (prisma) => {
        // Crear el alumno
        const nuevoAlumno = await prisma.alumno.create({
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
  
        // Crear cuenta corriente
        await prisma.ctaCte.create({
          data: {
            alumnoId: nuevoAlumno.id,
            saldo: 0
          }
        });
  
        // Crear deudas iniciales
        const currentDate = new Date();
    // Dentro de la transacción donde creamos las deudas
await Promise.all(estilos.map(estilo => 
  prisma.deuda.create({
    data: {
      alumnoId: nuevoAlumno.id,
      estiloId: estilo.id,
      monto: estilo.importe || 0,        // Usamos importe en lugar de monto
      montoOriginal: estilo.importe || 0, // Aquí también
      mes: (currentDate.getMonth() + 1).toString(),
      anio: currentDate.getFullYear(),
      fechaVencimiento: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        10
      ),
      pagada: false
    }
  })
));
  
        // Aplicar descuento automático si corresponde
        if (estilosIds.length >= 2) {
          const descuentoAutomatico = await prisma.descuento.findFirst({
            where: {
              esAutomatico: true,
              minEstilos: {
                lte: estilosIds.length
              },
              activo: true
            },
            orderBy: {
              porcentaje: 'desc'
            }
          });
  
          if (descuentoAutomatico) {
            await prisma.descuentoAplicado.create({
              data: {
                alumnoId: nuevoAlumno.id,
                descuentoId: descuentoAutomatico.id,
                fechaInicio: new Date(),
                activo: true
              }
            });
          }
        }
  
        // Aplicar descuento manual si existe
        if (descuentoManual) {
          const descuentoManualCreado = await prisma.descuento.create({
            data: {
              nombre: `Descuento Manual - ${nombre} ${apellido}`,
              porcentaje: descuentoManual,
              esAutomatico: false,
              activo: true
            }
          });
  
          await prisma.descuentoAplicado.create({
            data: {
              alumnoId: nuevoAlumno.id,
              descuentoId: descuentoManualCreado.id,
              fechaInicio: new Date(),
              activo: true
            }
          });
        }
  
        return nuevoAlumno;
      });
  
      // Si existía como alumno suelto, actualizar su referencia fuera de la transacción
      if (alumno.alumnosSueltosAnteriores?.length > 0) {
        await prisma.alumnoSuelto.update({
          where: { id: alumno.alumnosSueltosAnteriores[0].id },
          data: { alumnoRegularId: alumno.id }
        });
      }
  
      // Obtener el alumno actualizado con toda la información
      const alumnoCompleto = await prisma.alumno.findUnique({
        where: { id: alumno.id },
        include: {
          alumnoEstilos: {
            include: {
              estilo: true
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
  
      res.status(201).json(alumnoCompleto);
    } catch (error) {
      console.error('Error al crear alumno:', error);
      if (error instanceof Error && error.message === 'Ya existe un alumno con ese DNI') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Error al crear alumno' });
      }
    }
  }
  
  else if (req.method === 'PATCH') {
    try {
      const { id, activo, motivoBaja } = req.body;

      const alumno = await prisma.alumno.update({
        where: { id: parseInt(id) },
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

      // Si se está dando de baja, desactivar todos los estilos
      if (!activo) {
        await prisma.alumnoEstilos.updateMany({
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
        await prisma.descuentoAplicado.updateMany({
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

      res.status(200).json(alumno);
    } catch (error) {
      console.error('Error al actualizar alumno:', error);
      res.status(400).json({ error: 'Error al actualizar alumno' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}