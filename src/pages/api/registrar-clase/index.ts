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
    if (asistencias && asistencias.length > 0) {
      const alumnoIds = asistencias.map((a: any) => a.alumnoId);
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

    // === TRANSACCIÓN OPTIMIZADA - SOLO OPERACIONES DE ESCRITURA ===
    const clase = await prisma.$transaction(
      async (tx) => {
        // 1. Crear la clase
        const nuevaClase = await tx.clase.create({
          data: {
            fecha: new Date(fecha),
            profesorId: profesorIdInt,
            estiloId: estiloIdInt,
            modalidadId: modalidad.id
          },
          include: {
            profesor: true,
            estilo: true
          }
        });

        // 2. Crear asistencias y procesar deudas
        if (asistencias && asistencias.length > 0) {
          for (const asistencia of asistencias) {
            // Crear asistencia
            await tx.asistencia.create({
              data: {
                claseId: nuevaClase.id,
                alumnoId: asistencia.alumnoId,
                asistio: asistencia.asistio
              }
            });

            // Solo procesar deudas si el alumno asistió
            if (asistencia.asistio) {
              const alumno = alumnosInfo.find(a => a.id === asistencia.alumnoId);
              if (!alumno) continue;

              const estaInscritoAlEstilo = alumno.alumnoEstilos.length > 0;
              const tieneInscripcionPagada = alumno.inscripciones.length > 0;

              // Lógica simplificada de deudas
              if (!estaInscritoAlEstilo && !tieneInscripcionPagada) {
                // Clase suelta - buscar deuda existente
                const deudaExistente = await tx.deuda.findFirst({
                  where: {
                    alumnoId: asistencia.alumnoId,
                    estiloId: estiloIdInt,
                    mes,
                    anio,
                    tipoDeuda: TipoModalidad.SUELTA,
                    pagada: false
                  }
                });

                if (deudaExistente) {
                  // Actualizar deuda existente
                  await tx.deuda.update({
                    where: { id: deudaExistente.id },
                    data: {
                      cantidadClases: (deudaExistente.cantidadClases || 0) + 1,
                      monto: (concepto.montoSuelto ?? 0) * ((deudaExistente.cantidadClases || 0) + 1)
                    }
                  });
                } else {
                  // Crear nueva deuda suelta
                  await tx.deuda.create({
                    data: {
                      alumnoId: asistencia.alumnoId,
                      estiloId: estiloIdInt,
                      conceptoId: concepto.id,
                      monto: concepto.montoSuelto ?? 0,
                      mes,
                      anio,
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
                      estiloId: estiloIdInt,
                      conceptoId: concepto.id,
                      monto: concepto.montoRegular ?? 0,
                      mes,
                      anio,
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
                        anio,
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
        if (alumnosSueltos?.length > 0) {
          for (const alumnoSuelto of alumnosSueltos) {
            await tx.alumnoSuelto.create({
              data: {
                nombre: alumnoSuelto.nombre,
                apellido: alumnoSuelto.apellido,
                dni: alumnoSuelto.dni,
                telefono: alumnoSuelto.telefono || null,
                email: alumnoSuelto.email || null,
                clases: {
                  connect: { id: nuevaClase.id }
                }
              }
            });
          }
        }

        return {
          ...nuevaClase,
          modalidad: modalidad,
          modalidadTipo: modalidad.tipo
        };
      },
      {
        timeout: 20000, // Reducir timeout a 20 segundos
        maxWait: 15000, // Máximo tiempo de espera para obtener conexión
      }
    );

    res.status(200).json({ 
      message: 'Clase registrada con éxito', 
      clase 
    });

  } catch (error) {
    console.error('Error al registrar la clase:', error);
    
    // Manejo específico de errores de transacción
    if (error instanceof Error) {
      if (error.message.includes('Transaction')) {
        res.status(400).json({ 
          error: 'Error de transacción: La operación tomó demasiado tiempo. Intenta nuevamente.' 
        });
      } else {
        res.status(400).json({ 
          error: `Error al registrar la clase: ${error.message}` 
        });
      }
    } else {
      res.status(400).json({ 
        error: 'Error desconocido al registrar la clase' 
      });
    }
  }
}