import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { TipoModalidad } from '@prisma/client';

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
                  descripcion: true,
                  importe: true
                }
              },
              modalidad: true // Incluir la modalidad
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
              estilo: true,
              concepto: {
                select: {
                  id: true,
                  nombre: true,
                  montoRegular: true,
                  montoSuelto: true,
                  esInscripcion: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
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
      notas, estilosIds, descuentoManual, tipoAlumno 
    } = req.body;

    // Asegurarse de que tipoAlumno siempre tenga un valor predeterminado 'regular'
    const tipoAlumnoFinal = tipoAlumno || 'regular';

    // Verificaciones iniciales
    const alumnoExistente = await prisma.alumno.findUnique({
      where: { dni }
    });

    const alumnoSueltoExistente = await prisma.alumnoSuelto.findUnique({
      where: { dni }
    });

    if (tipoAlumnoFinal === 'regular' && alumnoExistente) {
      throw new Error('Ya existe un alumno regular con ese DNI');
    }

    if (tipoAlumnoFinal === 'suelto' && alumnoSueltoExistente) {
      throw new Error('Ya existe un alumno suelto con ese DNI');
    }

    // Si es alumno regular
    if (tipoAlumnoFinal === 'regular') {
      // El resto del código sigue igual...
        const resultado = await prisma.$transaction(async (tx) => {
          // Mapeo de estilos a modalidades
          const estiloModalidadMap: Record<number, number> = {};
          
          // Solo buscar modalidades si hay estilos seleccionados
          if (estilosIds && estilosIds.length > 0) {
            // Obtener las modalidades REGULAR para cada estilo
            const modalidades = await tx.modalidadClase.findMany({
              where: {
                estiloId: { in: estilosIds },
                tipo: TipoModalidad.REGULAR
              }
            });

            // Mapear estilosIds a sus modalidades correspondientes
            modalidades.forEach(modalidad => {
              estiloModalidadMap[modalidad.estiloId] = modalidad.id;
            });

            // Verificar que todos los estilos tengan una modalidad
            for (const estiloId of estilosIds) {
              if (!estiloModalidadMap[estiloId]) {
                throw new Error(`No se encontró modalidad REGULAR para el estilo ID ${estiloId}`);
              }
            }
          }

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
              // Crear alumnoEstilos solo si hay estilos seleccionados
              ...(estilosIds && estilosIds.length > 0 && {
                alumnoEstilos: {
                  create: estilosIds.map((id: number) => ({
                    estiloId: id,
                    modalidadId: estiloModalidadMap[id],
                    activo: true,
                    fechaInicio: new Date()
                  }))
                }
              }),
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

          // Generar deudas solo si hay estilos seleccionados
          if (estilosIds && estilosIds.length > 0) {
            // Obtener conceptos para cada estilo
            const conceptos = await tx.concepto.findMany({
              where: {
                estiloId: { in: estilosIds },
                esInscripcion: false
              }
            });

            // Mapear estilos a sus conceptos
            const estiloConceptoMap = conceptos.reduce((map, concepto) => {
              if (concepto.estiloId !== null) {
                map[concepto.estiloId] = concepto;
              }
              return map;
            }, {} as Record<number, any>);

            // Generar deudas desde el mes actual
            const fechaActual = new Date();
            const deudasACrear = [];

            // Usar el primer día del mes actual como fecha de inicio
            const fechaInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
            const fechaIteracion = new Date(fechaInicio);

            // Solo generamos para el mes actual
            while (fechaIteracion <= fechaActual) {
              for (const estiloId of estilosIds) {
                const concepto = estiloConceptoMap[estiloId];
                if (!concepto) {
                  throw new Error(`No se encontró concepto para el estilo ID ${estiloId}`);
                }

                deudasACrear.push({
                  alumnoId: nuevoAlumno.id,
                  estiloId: estiloId,
                  conceptoId: concepto.id,
                  monto: concepto.montoRegular, // Usar monto de la modalidad regular
                  mes: (fechaIteracion.getMonth() + 1).toString(),
                  anio: fechaIteracion.getFullYear(),
                  fechaVencimiento: new Date(
                    fechaIteracion.getFullYear(),
                    fechaIteracion.getMonth(),
                    10  // Vencimiento el día 10 de cada mes
                  ),
                  tipoDeuda: TipoModalidad.REGULAR, // Especificar tipo de modalidad
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

            if (deudasACrear.length > 0) {
              await tx.deuda.createMany({ data: deudasACrear });
            }

            // Crear deuda de inscripción
            const conceptoInscripcion = await tx.concepto.findFirst({
              where: {
                esInscripcion: true
              }
            });

            if (conceptoInscripcion) {
              await tx.deuda.create({
                data: {
                  alumnoId: nuevoAlumno.id,
                  monto: conceptoInscripcion.montoRegular ?? 0, // Usar montoRegular para inscripción
                  mes: (new Date()).getMonth() + 1 + '',
                  anio: new Date().getFullYear(),
                  estiloId: estilosIds[0],
                  conceptoId: conceptoInscripcion.id,
                  tipoDeuda: TipoModalidad.REGULAR, // Usar REGULAR para inscripción
                  pagada: false,
                  fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
              });
            }
          }

          // Aplicar descuentos solo si hay 2 o más estilos
          if (estilosIds && estilosIds.length >= 2) {
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

          // Aplicar descuento manual si se proporcionó
          if (descuentoManual) {
            const descuentoCreado = await tx.descuento.create({
              data: {
                nombre: `Descuento Manual - ${nombre} ${apellido}`,
                porcentaje: parseFloat(descuentoManual),
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
                include: { 
                  estilo: true,
                  modalidad: true
                }
              },
              alumnosSueltosAnteriores: true,
              deudas: {
                include: { 
                  estilo: true,
                  concepto: {
                    select: {
                      id: true,
                      nombre: true, 
                      montoRegular: true,
                      montoSuelto: true,
                      esInscripcion: true
                    }
                  } 
                }
              },
              descuentosVigentes: {
                where: { activo: true },
                include: { descuento: true }
              }
            }
          });
        });

        return res.status(201).json(resultado);
      } 
      // Si es alumno suelto
      else {
        const nuevoAlumnoSuelto = await prisma.alumnoSuelto.create({
          data: {
            nombre,
            apellido,
            dni,
            telefono,
            email,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        return res.status(201).json({
          ...nuevoAlumnoSuelto,
          tipoAlumno: 'suelto'
        });
      }

    } catch (error) {
      console.error('Error al crear alumno:', error);
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error al crear alumno' 
      });
    }
  }

  // PUT para edición
  if (req.method === 'PUT') {
    try {
      const { 
        id,
        nombre, 
        apellido, 
        dni, 
        fechaNacimiento, 
        email, 
        telefono, 
        numeroEmergencia, 
        direccion, 
        obraSocial, 
        nombreTutor, 
        dniTutor, 
        notas,
        estilosIds,
        tipoAlumno,
        descuentoManual 
      } = req.body;

      if (tipoAlumno === 'regular') {
        const resultado = await prisma.$transaction(async (tx) => {
          // Verificar DNI duplicado si se está cambiando
          const alumnoExistente = await tx.alumno.findFirst({
            where: {
              dni,
              NOT: { id: parseInt(id) }
            }
          });

          if (alumnoExistente) {
            throw new Error('Ya existe otro alumno con ese DNI');
          }

          // Actualizar alumno
          const alumnoActualizado = await tx.alumno.update({
            where: { id: parseInt(id) },
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
              updatedAt: new Date()
            }
          });

          // Actualizar estilos si se proporcionaron
          const nuevosEstilosIds = (estilosIds && estilosIds.length > 0) 
            ? estilosIds.map((id: string) => parseInt(id))
            : [];
          
          // Obtener estilos actuales del alumno
          const estilosActuales = await tx.alumnoEstilos.findMany({
            where: {
              alumnoId: parseInt(id),
              activo: true
            },
            select: {
              estiloId: true
            }
          });
          
          const estilosActualesIds = estilosActuales.map(e => e.estiloId);

          // Estilos a desactivar (los que están activos pero no están en la nueva lista)
          const estilosADesactivar = estilosActualesIds.filter(
            id => !nuevosEstilosIds.includes(id)
          );

          // Estilos a activar (los que están en la nueva lista pero no están activos)
          const estilosAAgregar = nuevosEstilosIds.filter(
            (id: number) => !estilosActualesIds.includes(id)
          );

          // Desactivar estilos que ya no se necesitan
          if (estilosADesactivar.length > 0) {
            await tx.alumnoEstilos.updateMany({
              where: {
                alumnoId: parseInt(id),
                estiloId: {
                  in: estilosADesactivar
                },
                activo: true
              },
              data: {
                activo: false,
                fechaFin: new Date()
              }
            });
          }

          // Agregar nuevos estilos
          for (const estiloId of estilosAAgregar) {
            // Buscar modalidad REGULAR para este estilo
            const modalidad = await tx.modalidadClase.findFirst({
              where: {
                estiloId: estiloId,
                tipo: TipoModalidad.REGULAR
              }
            });

            if (!modalidad) {
              throw new Error(`No se encontró modalidad REGULAR para el estilo ID ${estiloId}`);
            }

            // Verificar si ya existe un registro para esta combinación
            const estiloExistente = await tx.alumnoEstilos.findFirst({
              where: {
                alumnoId: parseInt(id),
                estiloId: estiloId
              }
            });

            if (estiloExistente) {
              // Si existe pero está inactivo, actualizarlo
              await tx.alumnoEstilos.updateMany({
                where: {
                  alumnoId: parseInt(id),
                  estiloId: estiloId
                },
                data: {
                  activo: true,
                  fechaFin: null,
                  fechaInicio: new Date()
                }
              });
            } else {
              // Si no existe, crear nuevo registro
              await tx.alumnoEstilos.create({
                data: {
                  alumnoId: parseInt(id),
                  estiloId: estiloId,
                  modalidadId: modalidad.id, // Usar la modalidad REGULAR
                  activo: true,
                  fechaInicio: new Date()
                }
              });
            }

            // Generar deuda para este nuevo estilo
            const concepto = await tx.concepto.findFirst({
              where: {
                estiloId: estiloId,
                esInscripcion: false
              }
            });

            if (concepto) {
              // Generar deuda para el mes actual
              const fechaActual = new Date();
              await tx.deuda.create({
                data: {
                  alumnoId: parseInt(id),
                  estiloId: estiloId,
                  conceptoId: concepto.id,
                  monto: concepto.montoRegular ?? 0,
                  mes: (fechaActual.getMonth() + 1).toString(),
                  anio: fechaActual.getFullYear(),
                  fechaVencimiento: new Date(
                    fechaActual.getFullYear(),
                    fechaActual.getMonth(),
                    10
                  ),
                  tipoDeuda: TipoModalidad.REGULAR,
                  pagada: false
                }
              });
            }
          }

          // Si es la primera vez que el alumno tiene estilos, generar deuda de inscripción
          if (estilosActualesIds.length === 0 && estilosAAgregar.length > 0) {
            const conceptoInscripcion = await tx.concepto.findFirst({
              where: {
                esInscripcion: true
              }
            });

            if (conceptoInscripcion) {
              await tx.deuda.create({
                data: {
                  alumnoId: parseInt(id),
                  monto: conceptoInscripcion.montoRegular ?? 0,
                  mes: (new Date()).getMonth() + 1 + '',
                  anio: new Date().getFullYear(),
                  estiloId: estilosAAgregar[0],
                  conceptoId: conceptoInscripcion.id,
                  tipoDeuda: TipoModalidad.REGULAR,
                  pagada: false,
                  fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
              });
            }
          }

          // Actualizar descuentos si se proporcionó uno nuevo
          if (descuentoManual) {
            // Desactivar descuentos manuales anteriores
            await tx.descuentoAplicado.updateMany({
              where: {
                alumnoId: parseInt(id),
                activo: true,
                descuento: {
                  esAutomatico: false
                }
              },
              data: {
                activo: false,
                fechaFin: new Date()
              }
            });

            // Crear nuevo descuento manual
            const descuentoCreado = await tx.descuento.create({
              data: {
                nombre: `Descuento Manual - ${nombre} ${apellido}`,
                porcentaje: parseFloat(descuentoManual),
                esAutomatico: false,
                activo: true
              }
            });

            await tx.descuentoAplicado.create({
              data: {
                alumnoId: parseInt(id),
                descuentoId: descuentoCreado.id,
                fechaInicio: new Date(),
                activo: true
              }
            });
          }

          // Retornar alumno actualizado con todas sus relaciones
          return await tx.alumno.findUnique({
            where: { id: parseInt(id) },
            include: {
              alumnoEstilos: {
                include: { 
                  estilo: true,
                  modalidad: true 
                }
              },
              alumnosSueltosAnteriores: true,
              deudas: {
                include: { 
                  estilo: true,
                  concepto: {
                    select: {
                      id: true,
                      nombre: true, 
                      montoRegular: true,
                      montoSuelto: true,
                      esInscripcion: true
                    }
                  }
                }
              },
              descuentosVigentes: {
                where: { activo: true },
                include: { descuento: true }
              }
            }
          });
        });
   
        return res.status(200).json(resultado);
      } 
      else {
        // Actualizar alumno suelto
        const alumnoSueltoActualizado = await prisma.alumnoSuelto.update({
          where: { id: parseInt(id) },
          data: {
            nombre,
            apellido,
            dni,
            telefono,
            email,
            updatedAt: new Date()
          }
        });

        return res.status(200).json({
          ...alumnoSueltoActualizado,
          tipoAlumno: 'suelto'
        });
      }

    } catch (error) {
      console.error('Error al actualizar alumno:', error);
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error al actualizar alumno' 
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
                    descripcion: true,
                    importe: true
                  }
                },
                modalidad: true
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
                estilo: true,
                concepto: {
                  select: {
                    id: true,
                    nombre: true,
                    montoRegular: true,
                    montoSuelto: true,
                    esInscripcion: true
                  }
                }
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