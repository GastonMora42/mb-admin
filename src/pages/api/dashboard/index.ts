// pages/api/dashboard/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener parámetros de la query
      const { 
        year = new Date().getFullYear(), 
        month = new Date().getMonth() + 1,
        profesor,
        estilo,
        tipoPago
      } = req.query;

      const currentYear = parseInt(year as string);
      const currentMonth = parseInt(month as string);
      
      // Calcular rango de fechas
      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      const previousMonth = new Date(currentYear, currentMonth - 2, 1);
      const lastDayPreviousMonth = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59, 999);

      // Construir filtros dinámicos
      const buildWhereClause = (additionalFilters: any = {}) => ({
        fecha: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        anulado: false,
        ...additionalFilters,
        ...(tipoPago && { tipoPago: tipoPago as string })
      });

      const buildProfesorFilter = () => profesor ? { profesorId: parseInt(profesor as string) } : {};
      const buildEstiloFilter = () => estilo ? { estiloId: parseInt(estilo as string) } : {};

      const [
        // Métricas básicas de alumnos
        alumnosActivos,
        alumnosNuevosActual,
        alumnosNuevosPrevio,
        alumnosInactivos,
        alumnosBajas,
        
        // Clases y asistencias
        clasesDelMes,
        asistenciasDelMes,
        clasesTotalesMes,
        
        // Finanzas
        ingresosDelMes,
        ingresosMesPrevio,
        deudasDelMes,
        deudasPendientes,
        cuotasRegularesPagadas,
        
        // Alumnos sueltos e inscripciones
        alumnosSueltosMes,
        inscripcionesMes,
        
        // Medios de pago
        mediosPago,
        
        // Rankings con filtros
        estilosPopulares,
        profesoresRanking,
        alumnosAsistencia,
        
        // Datos para filtros
        profesoresDisponibles,
        estilosDisponibles
      ] = await Promise.all([
        // Alumnos activos
        prisma.alumno.count({
          where: { 
            activo: true,
            ...(estilo && {
              alumnoEstilos: {
                some: {
                  estiloId: parseInt(estilo as string),
                  activo: true
                }
              }
            })
          }
        }),

        // Alumnos nuevos mes actual
        prisma.alumno.count({
          where: {
            fechaIngreso: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            },
            ...(estilo && {
              alumnoEstilos: {
                some: {
                  estiloId: parseInt(estilo as string),
                  activo: true
                }
              }
            })
          }
        }),

        // Alumnos nuevos mes previo (para calcular crecimiento)
        prisma.alumno.count({
          where: {
            fechaIngreso: {
              gte: previousMonth,
              lte: lastDayPreviousMonth
            }
          }
        }),

        // Alumnos inactivos
        prisma.alumno.count({
          where: { 
            activo: false,
            ...(estilo && {
              alumnoEstilos: {
                some: {
                  estiloId: parseInt(estilo as string)
                }
              }
            })
          }
        }),

        // Bajas del mes
        prisma.alumno.count({
          where: {
            fechaBaja: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          }
        }),
        
        // Clases del mes
        prisma.clase.count({
          where: {
            fecha: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            },
            ...buildProfesorFilter(),
            ...buildEstiloFilter()
          }
        }),
        
        // Asistencias del mes
        prisma.asistencia.count({
          where: {
            asistio: true,
            clase: {
              fecha: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth
              },
              ...buildProfesorFilter(),
              ...buildEstiloFilter()
            }
          }
        }),

        // Total de clases posibles (para calcular tasa de asistencia)
        prisma.asistencia.count({
          where: {
            clase: {
              fecha: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth
              },
              ...buildProfesorFilter(),
              ...buildEstiloFilter()
            }
          }
        }),

        // Ingresos del mes actual
        prisma.recibo.aggregate({
          where: buildWhereClause({
            ...(profesor && {
              OR: [
                { concepto: { estilo: { profesorId: parseInt(profesor as string) } } },
                { clase: { profesorId: parseInt(profesor as string) } }
              ]
            }),
            ...(estilo && {
              OR: [
                { concepto: { estiloId: parseInt(estilo as string) } },
                { clase: { estiloId: parseInt(estilo as string) } }
              ]
            })
          }),
          _sum: { monto: true }
        }),

        // Ingresos del mes previo (para calcular crecimiento)
        prisma.recibo.aggregate({
          where: {
            fecha: {
              gte: previousMonth,
              lte: lastDayPreviousMonth
            },
            anulado: false
          },
          _sum: { monto: true }
        }),

        // Deudas generadas en el mes
        prisma.deuda.aggregate({
          where: {
            mes: currentMonth.toString(),
            anio: currentYear,
            ...(estilo && { estiloId: parseInt(estilo as string) })
          },
          _sum: { monto: true }
        }),

        // Deudas pendientes totales
        prisma.deuda.aggregate({
          where: {
            pagada: false,
            ...(estilo && { estiloId: parseInt(estilo as string) })
          },
          _sum: { monto: true }
        }),

        // Cuotas regulares pagadas
        prisma.recibo.count({
          where: buildWhereClause({
            concepto: {
              esInscripcion: false,
              ...(estilo && { estiloId: parseInt(estilo as string) })
            },
            esMesCompleto: true
          })
        }),

        // Alumnos sueltos del mes
        prisma.alumnoSuelto.count({
          where: {
            createdAt: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          }
        }),

        // Inscripciones del mes
        prisma.recibo.count({
          where: buildWhereClause({
            concepto: { esInscripcion: true }
          })
        }),

        // Medios de pago del mes
        prisma.recibo.groupBy({
          by: ['tipoPago'],
          where: buildWhereClause({
            ...(profesor && {
              OR: [
                { concepto: { estilo: { profesorId: parseInt(profesor as string) } } },
                { clase: { profesorId: parseInt(profesor as string) } }
              ]
            }),
            ...(estilo && {
              OR: [
                { concepto: { estiloId: parseInt(estilo as string) } },
                { clase: { estiloId: parseInt(estilo as string) } }
              ]
            })
          }),
          _sum: { monto: true },
          _count: true
        }),

        // Estilos populares (con filtros)
        prisma.estilo.findMany({
          where: {
            ...(profesor && { profesorId: parseInt(profesor as string) }),
            ...(estilo && { id: parseInt(estilo as string) })
          },
          select: {
            nombre: true,
            _count: {
              select: {
                alumnoEstilos: {
                  where: {
                    activo: true,
                    alumno: { activo: true }
                  }
                }
              }
            }
          },
          orderBy: {
            alumnoEstilos: { _count: 'desc' }
          },
          take: 8
        }),

        // Profesores del mes (con filtros)
        prisma.profesor.findMany({
          where: {
            ...(profesor && { id: parseInt(profesor as string) }),
            ...(estilo && {
              estilos: {
                some: { id: parseInt(estilo as string) }
              }
            })
          },
          select: {
            nombre: true,
            apellido: true,
            _count: {
              select: {
                clases: {
                  where: {
                    fecha: {
                      gte: firstDayOfMonth,
                      lte: lastDayOfMonth
                    },
                    ...(estilo && { estiloId: parseInt(estilo as string) })
                  }
                }
              }
            }
          },
          orderBy: {
            clases: { _count: 'desc' }
          },
          take: 10
        }),

        // Alumnos por asistencia (con filtros)
        prisma.alumno.findMany({
          where: { 
            activo: true,
            ...(estilo && {
              alumnoEstilos: {
                some: {
                  estiloId: parseInt(estilo as string),
                  activo: true
                }
              }
            })
          },
          select: {
            nombre: true,
            apellido: true,
            _count: {
              select: {
                asistencias: {
                  where: {
                    asistio: true,
                    clase: {
                      fecha: {
                        gte: firstDayOfMonth,
                        lte: lastDayOfMonth
                      },
                      ...buildProfesorFilter(),
                      ...buildEstiloFilter()
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            asistencias: { _count: 'desc' }
          },
          take: 15
        }),

        // Datos para filtros - Profesores disponibles
        prisma.profesor.findMany({
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            apellido: true
          },
          orderBy: { apellido: 'asc' }
        }),

        // Datos para filtros - Estilos disponibles
        prisma.estilo.findMany({
          select: {
            id: true,
            nombre: true
          },
          orderBy: { nombre: 'asc' }
        })
      ]);

      // Procesamiento de medios de pago
      const mediosPagoProcessed = mediosPago.reduce((acc: Record<string, { monto: number; cantidad: number }>, medio: any) => {
        acc[medio.tipoPago] = {
          monto: medio._sum.monto || 0,
          cantidad: medio._count
        };
        return acc;
      }, {});

      // Cálculo de tasas
      const tasaCrecimiento = alumnosNuevosPrevio > 0 
        ? (((alumnosNuevosActual - alumnosNuevosPrevio) / alumnosNuevosPrevio) * 100).toFixed(1)
        : "0";

      const tasaAsistencia = clasesTotalesMes > 0
        ? ((asistenciasDelMes / clasesTotalesMes) * 100).toFixed(1)
        : "0";

      const tasaCobranza = deudasDelMes._sum?.monto && deudasDelMes._sum.monto > 0
        ? (((ingresosDelMes._sum?.monto || 0) / deudasDelMes._sum.monto) * 100).toFixed(1)
        : "0";

      // Preparar nombres de meses en español
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      res.status(200).json({
        metricas: {
          alumnos: {
            activos: alumnosActivos,
            nuevos: alumnosNuevosActual,
            inactivos: alumnosInactivos,
            sueltos: alumnosSueltosMes,
            bajas: alumnosBajas,
            inscripciones: inscripcionesMes,
            tasaCrecimiento
          },
          clases: {
            total: clasesDelMes,
            asistencias: asistenciasDelMes,
            tasaAsistencia
          },
          finanzas: {
            ingresos: ingresosDelMes._sum?.monto || 0,
            deudasMes: deudasDelMes._sum?.monto || 0,
            deudasTotales: deudasPendientes._sum?.monto || 0,
            tasaCobranza,
            mediosPago: mediosPagoProcessed,
            cuotasRegularesPagadas: cuotasRegularesPagadas
          }
        },
        rankings: {
          estilosPopulares: estilosPopulares.filter((e: { _count: { alumnoEstilos: number; }; }) => e._count.alumnoEstilos > 0),
          profesores: profesoresRanking.filter((p: { _count: { clases: number; }; }) => p._count.clases > 0),
          alumnosAsistencia: alumnosAsistencia.filter((a: { _count: { asistencias: number; }; }) => a._count.asistencias > 0)
        },
        periodo: {
          mes: monthNames[currentMonth - 1],
          anio: currentYear
        },
        filtros: {
          profesores: profesoresDisponibles,
          estilos: estilosDisponibles,
          aplicados: {
            profesor: profesor || null,
            estilo: estilo || null,
            tipoPago: tipoPago || null
          }
        },
        ultimaActualizacion: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      res.status(500).json({ 
        error: 'Error al obtener datos del dashboard',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}