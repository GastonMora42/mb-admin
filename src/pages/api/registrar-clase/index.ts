// pages/api/registrar-clase.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { TipoModalidad } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { profesorId, estiloId, fecha, asistencias, alumnosSueltos, tipoModalidad } = req.body;

    // Validación de datos de entrada
    if (!profesorId || !estiloId || !fecha || (!asistencias && !alumnosSueltos)) {
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

    // Obtener los conceptos para este estilo
    const concepto = await prisma.concepto.findFirst({
      where: {
        estiloId: parseInt(estiloId),
        esInscripcion: false
      }
    });

    if (!concepto) {
      return res.status(400).json({ 
        error: 'No se encontró un concepto para este estilo' 
      });
    }

    // Obtener el concepto de inscripción
    const conceptoInscripcion = await prisma.concepto.findFirst({
      where: { esInscripcion: true }
    });

    // Determinar el tipo de modalidad (REGULAR por defecto)
    const modalidadTipo = tipoModalidad || TipoModalidad.REGULAR;

    const clase = await prisma.$transaction(
      async (tx) => {
        // Buscar la modalidad adecuada para este estilo
        const modalidad = await tx.modalidadClase.findFirst({
          where: {
            estiloId: parseInt(estiloId),
            tipo: modalidadTipo
          }
        });
    
        if (!modalidad) {
          throw new Error(`No se encontró la modalidad ${modalidadTipo} para el estilo ID ${estiloId}`);
        }
    
      const nuevaClase = await tx.clase.create({
        data: {
          fecha: new Date(fecha),
          profesorId: parseInt(profesorId),
          estiloId: parseInt(estiloId),
          modalidadId: modalidad.id
        },
        include: {
          profesor: true,
          estilo: true,
          modalidad: true
        }
      });

      // Procesar asistencias para alumnos regulares y potenciales clases sueltas
      if (asistencias && asistencias.length > 0) {
        for (const asistencia of asistencias) {
          // Obtener información del alumno
          const alumno = await tx.alumno.findUnique({
            where: { id: asistencia.alumnoId },
            include: {
              alumnoEstilos: {
                where: { 
                  estiloId: parseInt(estiloId),
                  activo: true
                }
              },
              // Verificar inscripción pagada
              inscripciones: {
                where: { pagada: true }
              }
            }
          });

          if (!alumno) continue;

          // Verificar si está inscripto al estilo
          const estaInscritoAlEstilo = alumno.alumnoEstilos.length > 0;
          // Verificar si tiene la inscripción pagada
          const tieneInscripcionPagada = alumno.inscripciones.length > 0;

          // Crear la asistencia
          await tx.asistencia.create({
            data: {
              claseId: nuevaClase.id,
              alumnoId: asistencia.alumnoId,
              asistio: asistencia.asistio
            }
          });

          // Si el alumno asistió, procesar deuda según su situación
          if (asistencia.asistio) {
            const fechaActual = new Date();
            const mes = (fechaActual.getMonth() + 1).toString();
            const anio = fechaActual.getFullYear();

            // Caso 1: No está inscripto al estilo y no tiene inscripción pagada
            // -> Generar deuda por clase suelta
// En la API registrar-clase.ts, modifica esta parte del código:

// Caso 1: No está inscripto al estilo y no tiene inscripción pagada
// -> Generar deuda por clase suelta
if (!estaInscritoAlEstilo && !tieneInscripcionPagada) {
  // Verificar si ya tiene una deuda por este estilo en este mes
  const deudaExistente = await tx.deuda.findFirst({
    where: {
      alumnoId: asistencia.alumnoId,
      estiloId: parseInt(estiloId),
      conceptoId: concepto.id,
      mes,
      anio,
      tipoDeuda: TipoModalidad.SUELTA,  // Importante: usar SUELTA aquí
      pagada: false
    }
  });

  if (deudaExistente) {
    // Actualizar deuda existente incrementando la cantidad de clases
    await tx.deuda.update({
      where: { id: deudaExistente.id },
      data: {
        cantidadClases: (deudaExistente.cantidadClases || 0) + 1,
        // Usar montoSuelto y multiplicar por la cantidad de clases
        monto: (concepto.montoSuelto ?? 0) * ((deudaExistente.cantidadClases || 0) + 1)
      }
    });
  } else {
    // Crear nueva deuda por clase suelta
    console.log("Creando deuda por clase suelta para alumno:", asistencia.alumnoId);
    
    const nuevaDeuda = await tx.deuda.create({
      data: {
        alumnoId: asistencia.alumnoId,
        estiloId: parseInt(estiloId),
        conceptoId: concepto.id,
        monto: concepto.montoSuelto,  // Asegúrate de usar montoSuelto, no montoRegular
        mes,
        anio,
        tipoDeuda: TipoModalidad.SUELTA,  // Tipo SUELTA para clase individual
        cantidadClases: 1,
        pagada: false,
        fechaVencimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 10)
      } as any
    });
    
    console.log("Deuda creada:", nuevaDeuda);
  }
}
            // Caso 2: No está inscripto al estilo pero tiene inscripción pagada
            // -> Verificar si ya tiene deuda mensual, si no, crearla
            else if (!estaInscritoAlEstilo && tieneInscripcionPagada) {
              // Verificar si ya tiene una deuda mensual por este estilo
              const deudaMensual = await tx.deuda.findFirst({
                where: {
                  alumnoId: asistencia.alumnoId,
                  estiloId: parseInt(estiloId),
                  conceptoId: concepto.id,
                  mes,
                  anio,
                  tipoDeuda: TipoModalidad.REGULAR,
                  pagada: false
                }
              });

              if (!deudaMensual) {
                // Crear deuda mensual
                await tx.deuda.create({
                  data: {
                    alumnoId: asistencia.alumnoId,
                    estiloId: parseInt(estiloId),
                    conceptoId: concepto.id,
                    monto: concepto.montoRegular,
                    mes,
                    anio,
                    tipoDeuda: TipoModalidad.REGULAR,
                    pagada: false,
                    fechaVencimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 10)
                  }
                });

                // Si ya tenía deudas por clases sueltas, las eliminamos ya que ahora paga el mes completo
                const deudasSueltas = await tx.deuda.findMany({
                  where: {
                    alumnoId: asistencia.alumnoId,
                    estiloId: parseInt(estiloId),
                    mes,
                    anio,
                    tipoDeuda: TipoModalidad.SUELTA,
                    pagada: false
                  }
                });

                if (deudasSueltas.length > 0) {
                  await tx.deuda.deleteMany({
                    where: {
                      id: { in: deudasSueltas.map(d => d.id) }
                    }
                  });
                }
              }
            }
            // Caso 3: Si está inscripto al estilo y no tiene deuda regular para este mes, crearla
            else if (estaInscritoAlEstilo) {
              const deudaMensual = await tx.deuda.findFirst({
                where: {
                  alumnoId: asistencia.alumnoId,
                  estiloId: parseInt(estiloId),
                  conceptoId: concepto.id,
                  mes,
                  anio,
                  tipoDeuda: TipoModalidad.REGULAR,
                  pagada: false
                }
              });

              if (!deudaMensual) {
                await tx.deuda.create({
                  data: {
                    alumnoId: asistencia.alumnoId,
                    estiloId: parseInt(estiloId),
                    conceptoId: concepto.id,
                    monto: concepto.montoRegular,
                    mes,
                    anio,
                    tipoDeuda: TipoModalidad.REGULAR,
                    pagada: false,
                    fechaVencimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 10)
                  }
                });
              }
            }
          }
        }
      }

      // Procesar alumnos sueltos
      if (alumnosSueltos?.length > 0) {
        for (const alumnoSuelto of alumnosSueltos) {
          await tx.alumnoSuelto.create({
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
    },
    {
      timeout: 30000, // 30 segundos
    }
  );

    res.status(200).json({ 
      message: 'Clase registrada con éxito', 
      clase 
    });
  } catch (error) {
    console.error('Error al registrar la clase:', error);
    if (error instanceof Error) {
      res.status(400).json({ 
        error: `Error al registrar la clase: ${error.message}` 
      });
    } else {
      res.status(400).json({ 
        error: 'Error desconocido al registrar la clase' 
      });
    }
  }
}