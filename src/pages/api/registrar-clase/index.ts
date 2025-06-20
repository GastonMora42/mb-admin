// pages/api/registrar-clase/index.ts
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
    if (!profesorId || !estiloId || !fecha) {
      return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    const profesorIdInt = parseInt(profesorId);
    const estiloIdInt = parseInt(estiloId);
    const modalidadTipo = tipoModalidad || TipoModalidad.REGULAR;

    // === HACER TODAS LAS CONSULTAS DE VALIDACIÓN FUERA DE LA TRANSACCIÓN ===
    
    // Validar que el profesor existe y puede dar el estilo
    const profesor = await prisma.profesor.findFirst({
      where: {
        id: profesorIdInt,
        estilos: {
          some: {
            id: estiloIdInt
          }
        }
      }
    });

    if (!profesor) {
      return res.status(400).json({ 
        error: 'El profesor no existe o no está habilitado para dar este estilo' 
      });
    }

    // Obtener modalidad
    const modalidad = await prisma.modalidadClase.findFirst({
      where: {
        estiloId: estiloIdInt,
        tipo: modalidadTipo
      }
    });

    if (!modalidad) {
      return res.status(400).json({ 
        error: `No se encontró la modalidad ${modalidadTipo} para el estilo ID ${estiloIdInt}` 
      });
    }

    // Obtener concepto
    const concepto = await prisma.concepto.findFirst({
      where: {
        estiloId: estiloIdInt,
        esInscripcion: false
      }
    });

    if (!concepto) {
      return res.status(400).json({ 
        error: 'No se encontró un concepto para este estilo' 
      });
    }

    // Preparar datos para la transacción
    const fechaActual = new Date();
    const mes = (fechaActual.getMonth() + 1).toString();
    const anio = fechaActual.getFullYear();
    
    // Obtener información de alumnos SI hay asistencias
    let alumnosInfo: any[] = [];
    if (asistencias && Array.isArray(asistencias) && asistencias.length > 0) {
      const alumnoIds = asistencias.map((a: any) => a.alumnoId).filter(id => id);
      if (alumnoIds.length > 0) {
        alumnosInfo = await prisma.alumno.findMany({
          where: { 
            id: { in: alumnoIds }
          },
          include: {
            alumnoEstilos: {
              where: { 
                estiloId: estiloIdInt,
                activo: true
              }
            },
            inscripciones: {
              where: { pagada: true }
            }
          }
        });
      }
    }

    // Verificar si ya existe una clase en la misma fecha/hora
    const claseExistente = await prisma.clase.findFirst({
      where: {
        fecha: new Date(fecha),
        profesorId: profesorIdInt,
        estiloId: estiloIdInt
      }
    });

    let clase;

    if (claseExistente) {
      // Si la clase ya existe, solo actualizamos las asistencias
      clase = claseExistente;
      console.log('Clase existente encontrada, actualizando asistencias...');
    } else {
      // Crear nueva clase
      clase = await prisma.clase.create({
        data: {
          fecha: new Date(fecha),
          profesorId: profesorIdInt,
          estiloId: estiloIdInt,
          modalidadId: modalidad.id
        },
        include: {
          profesor: true,
          estilo: true,        }
      });
    }

    // === TRANSACCIÓN OPTIMIZADA - SOLO OPERACIONES DE ESCRITURA ===
    await prisma.$transaction(
      async (tx) => {
        // 1. Limpiar asistencias existentes si estamos actualizando
        if (claseExistente) {
          await tx.asistencia.deleteMany({
            where: { claseId: clase.id }
          });
        }

        // 2. Crear asistencias y procesar deudas
        if (asistencias && Array.isArray(asistencias) && asistencias.length > 0) {
          for (const asistencia of asistencias) {
            if (!asistencia.alumnoId) continue;

            // Crear asistencia
            await tx.asistencia.create({
              data: {
                claseId: clase.id,
                alumnoId: asistencia.alumnoId,
                asistio: Boolean(asistencia.asistio)
              }
            });

            // Solo procesar deudas si el alumno asistió
            if (asistencia.asistio) {
              const alumno = alumnosInfo.find(a => a.id === asistencia.alumnoId);
              if (!alumno) continue;

              const estaInscritoAlEstilo = alumno.alumnoEstilos && alumno.alumnoEstilos.length > 0;
              const tieneInscripcionPagada = alumno.inscripciones && alumno.inscripciones.length > 0;

              // Lógica de deudas
              if (!estaInscritoAlEstilo && !tieneInscripcionPagada) {
                // Clase suelta - buscar deuda existente
                const deudaExistente = await tx.deuda.findFirst({
                  where: {
                    alumnoId: asistencia.alumnoId,
                    estiloId: estiloIdInt,
                    mes,
                    anio: anio,
                    tipoDeuda: TipoModalidad.SUELTA,
                    pagada: false
                  }
                });

                if (deudaExistente) {
                  // Actualizar deuda existente
                  const nuevaCantidad = (deudaExistente.cantidadClases || 0) + 1;
                  await tx.deuda.update({
                    where: { id: deudaExistente.id },
                    data: {
                      cantidadClases: nuevaCantidad,
                      monto: (concepto.montoSuelto || 0) * nuevaCantidad
                    }
                  });
                } else {
                  // Crear nueva deuda suelta
                  await tx.deuda.create({
                    data: {
                      alumnoId: asistencia.alumnoId,
                      estiloId: estiloIdInt,
                      conceptoId: concepto.id,
                      monto: concepto.montoSuelto || 0,
                      mes,
                      anio: anio,
                      tipoDeuda: TipoModalidad.SUELTA,
                      cantidadClases: 1,
                      pagada: false,
                      fechaVencimiento: new Date(anio, fechaActual.getMonth(), 10)
                    }
                  });
                }
              } else if (estaInscritoAlEstilo || tieneInscripcionPagada) {
                // Deuda regular - verificar si ya existe
                const deudaMensual = await tx.deuda.findFirst({
                  where: {
                    alumnoId: asistencia.alumnoId,
                    estiloId: estiloIdInt,
                    mes,
                    anio: anio,
                    tipoDeuda: TipoModalidad.REGULAR,
                    pagada: false
                  }
                });

                if (!deudaMensual) {
                  // Crear deuda mensual
                  await tx.deuda.create({
                    data: {
                      alumnoId: asistencia.alumnoId,
                      estiloId: estiloIdInt,
                      conceptoId: concepto.id,
                      monto: concepto.montoRegular || 0,
                      mes,
                      anio: anio,
                      tipoDeuda: TipoModalidad.REGULAR,
                      pagada: false,
                      fechaVencimiento: new Date(anio, fechaActual.getMonth(), 10)
                    }
                  });

                  // Si cambió de suelta a regular, eliminar deudas sueltas del mes
                  if (!estaInscritoAlEstilo && tieneInscripcionPagada) {
                    await tx.deuda.deleteMany({
                      where: {
                        alumnoId: asistencia.alumnoId,
                        estiloId: estiloIdInt,
                        mes,
                        anio: anio,
                        tipoDeuda: TipoModalidad.SUELTA,
                        pagada: false
                      }
                    });
                  }
                }
              }
            }
          }
        }

        // 3. Crear alumnos sueltos
        if (alumnosSueltos && Array.isArray(alumnosSueltos) && alumnosSueltos.length > 0) {
          // Limpiar alumnos sueltos existentes si estamos actualizando
          if (claseExistente) {
            await tx.alumnoSuelto.deleteMany({
              where: {
                clases: {
                  some: { id: clase.id }
                }
              }
            });
          }

          for (const alumnoSuelto of alumnosSueltos) {
            if (!alumnoSuelto.nombre || !alumnoSuelto.apellido) continue;

            await tx.alumnoSuelto.create({
              data: {
                nombre: alumnoSuelto.nombre,
                apellido: alumnoSuelto.apellido,
                dni: alumnoSuelto.dni || '',
                telefono: alumnoSuelto.telefono || null,
                email: alumnoSuelto.email || null,
                clases: {
                  connect: { id: clase.id }
                }
              }
            });
          }
        }
      },
      {
        timeout: 30000, // 30 segundos
        maxWait: 10000, // 10 segundos para obtener conexión
      }
    );

    // Obtener clase completa con relaciones
    const claseCompleta = await prisma.clase.findUnique({
      where: { id: clase.id },
      include: {
        profesor: true,
        estilo: true,
        asistencias: {
          include: {
            alumno: true
          }
        },
        alumnosSueltos: true
      }
    });

    res.status(200).json({ 
      message: claseExistente ? 'Asistencia actualizada con éxito' : 'Clase registrada con éxito', 
      clase: {
        ...claseCompleta,
        modalidadTipo: modalidad.tipo
      }
    });

  } catch (error) {
    console.error('Error al registrar la clase:', error);
    
    // Manejo específico de errores
    if (error instanceof Error) {
      if (error.message.includes('Transaction') || error.message.includes('timeout')) {
        res.status(408).json({ 
          error: 'La operación tomó demasiado tiempo. Por favor, intenta nuevamente.' 
        });
      } else if (error.message.includes('Unique constraint')) {
        res.status(409).json({ 
          error: 'Ya existe una clase registrada en esta fecha y hora.' 
        });
      } else {
        res.status(400).json({ 
          error: `Error al registrar la clase: ${error.message}` 
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }
}