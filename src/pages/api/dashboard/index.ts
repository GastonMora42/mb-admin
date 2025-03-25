// pages/api/dashboard/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [
        // Métricas básicas
        alumnosActivos,
        alumnosNuevos,
        alumnosInactivos,
        clasesDelMes,
        asistenciasDelMes,
        
        // Nueva métrica: cuotas regulares pagadas
        cuotasRegularesPagadas,
        
        // Métricas financieras
        ingresosDelMes,
        deudasDelMes,
        deudasPendientes,
        
        // Alumnos sueltos
        alumnosSueltosMes,
        
        // Medios de pago
        bajasMes,           // Agregamos bajas del mes
        inscripcionesMes,
        
        mediosPago
      ] = await Promise.all([
        // Alumnos activos
        prisma.alumno.count({
          where: { activo: true }
        }),

        // Alumnos nuevos del mes
        prisma.alumno.count({
          where: {
            fechaIngreso: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          }
        }),

        // Alumnos inactivos
        prisma.alumno.count({
          where: { activo: false }
        }),
        
        // Clases del mes
        prisma.clase.count({
          where: {
            fecha: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
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
              }
            }
          }
        }),

        // Cuotas regulares pagadas del mes (recibos no anulados con tipoDeuda = REGULAR)
        prisma.recibo.count({
          where: {
            fecha: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            },
            anulado: false,
            concepto: {
              esInscripcion: false
            },
            // Aquí podemos filtrar para contar solo las cuotas regulares
            esMesCompleto: true
          }
        }),

        // Ingresos del mes
        prisma.recibo.aggregate({
          where: {
            fecha: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          _sum: {
            monto: true
          }
        }),

        // Deudas del mes
        prisma.deuda.aggregate({
          where: {
            mes: (currentDate.getMonth() + 1).toString(),
            anio: currentDate.getFullYear()
          },
          _sum: {
            monto: true
          }
        }),

        // Deudas pendientes total
        prisma.deuda.aggregate({
          where: {
            pagada: false
          },
          _sum: {
            monto: true
          }
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

        // Bajas del mes
        prisma.alumno.count({
          where: {
            fechaBaja: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          }
        }),

        // Inscripciones del mes (recibos de inscripción)
        prisma.recibo.count({
          where: {
            fecha: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            },
            concepto: {
              esInscripcion: true
            },
            anulado: false // No contar recibos anulados
          }
        }),

        // Medios de pago del mes
        prisma.recibo.groupBy({
          by: ['tipoPago'],
          where: {
            fecha: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          _sum: {
            monto: true
          },
          _count: true
        })
      ]);

      // Rankings limitados
      const [estilosPopulares, profesoresRanking, alumnosAsistencia] = await Promise.all([
        // Top 5 estilos
        prisma.estilo.findMany({
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
            alumnoEstilos: {
              _count: 'desc'
            }
          },
          take: 5
        }),

        // Top 5 profesores
        prisma.profesor.findMany({
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
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            clases: {
              _count: 'desc'
            }
          },
          take: 5
        }),

        // Top 10 alumnos por asistencia
        prisma.alumno.findMany({
          where: { activo: true },
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
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            asistencias: {
              _count: 'desc'
            }
          },
          take: 10
        })
      ]);
  
      // Procesamiento de medios de pago
      const mediosPagoProcessed = mediosPago.reduce((acc: { [x: string]: { monto: any; cantidad: any; }; }, medio: { tipoPago: string | number; _sum: { monto: any; }; _count: any; }) => {
        acc[medio.tipoPago] = {
          monto: medio._sum.monto || 0,
          cantidad: medio._count
        };
        return acc;
      }, {} as Record<string, { monto: number; cantidad: number }>);

      // Cálculo de tasas
      const tasaCrecimiento = alumnosActivos > 0 
        ? ((alumnosNuevos / alumnosActivos) * 100).toFixed(1)
        : "0";

      const tasaAsistencia = clasesDelMes > 0 && alumnosActivos > 0
        ? ((asistenciasDelMes / (clasesDelMes * alumnosActivos)) * 100).toFixed(1)
        : "0";

      const tasaCobranza = deudasDelMes._sum?.monto 
        ? ((ingresosDelMes._sum?.monto || 0) / deudasDelMes._sum.monto * 100).toFixed(1)
        : "0";

      res.status(200).json({
        metricas: {
          alumnos: {
            activos: alumnosActivos,
            nuevos: alumnosNuevos,
            inactivos: alumnosInactivos,
            sueltos: alumnosSueltosMes,
            bajas: bajasMes,           // Agregamos bajas
            inscripciones: inscripcionesMes, // Agregamos inscripciones
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
            cuotasRegularesPagadas: cuotasRegularesPagadas // Añadir nueva métrica
          }
        },
        rankings: {
          estilosPopulares,
          profesores: profesoresRanking,
          alumnosAsistencia
        },
        periodo: {
          mes: currentDate.toLocaleString('es-ES', { month: 'long' }),
          anio: currentDate.getFullYear()
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