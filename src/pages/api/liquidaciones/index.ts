// pages/api/liquidaciones.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { Prisma, TipoModalidad } from '@prisma/client'

interface LiquidacionResponse {
  regularCount: number;
  sueltasCount: number;
  clasesCount: number; // Contador de clases sueltas tomadas
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: any[];
  periodo: string;
  detallesPorProfesor?: {
    [key: string]: {
      nombre: string;
      recibos: any[];
      totalRegular: number;
      totalSueltas: number;
      montoLiquidacionRegular: number;
      montoLiquidacionSueltas: number;
    };
  };
}

interface PorcentajesPersonalizados {
  porcentajeRegular: number;
  porcentajeSueltas: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const profesores = await prisma.profesor.findMany({
        orderBy: {
          apellido: 'asc'
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          porcentajePorDefecto: true,
          porcentajeClasesSueltasPorDefecto: true,
          estilos: true
        }
      });
      
      return res.status(200).json(profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return res.status(500).json({ error: 'Error al obtener profesores' });
    }
  }

  if (req.method === 'POST') {
    const { periodo, profesorId, porcentajes } = req.body;

    try {
      if (!periodo) {
        return res.status(400).json({ error: 'El período es requerido' });
      }

      const [year, month] = periodo.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      // Primero obtenemos los estilos del profesor
      const profesor = await prisma.profesor.findUnique({
        where: { id: Number(profesorId) },
        include: {
          estilos: true
        }
      });

      if (!profesor) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      const estilosIds = profesor.estilos.map(e => e.id);

      // Construimos la consulta para los recibos
      const where: Prisma.ReciboWhereInput = {
        AND: [
          { 
            fechaEfecto: {
              gte: startDate,
              lte: endDate
            }
          },
          { anulado: false },
          {
            OR: [
              // Recibos regulares por los estilos del profesor
              {
                concepto: {
                  estilo: {
                    profesorId: Number(profesorId)
                  }
                }
              },
              // Clases sueltas donde el profesor dio la clase
              {
                OR: [
                  {
                    AND: [
                      { esClaseSuelta: true },
                      {
                        clase: {
                          profesorId: Number(profesorId)
                        }
                      }
                    ]
                  },
                  {
                    clase: {
                      profesorId: Number(profesorId),
                      modalidad: {
                        tipo: TipoModalidad.SUELTA
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      console.log('Query where:', JSON.stringify(where, null, 2));

      // Obtener recibos
      const recibos = await prisma.recibo.findMany({
        where,
        include: {
          alumno: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          alumnoSuelto: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          concepto: {
            include: {
              estilo: true
            }
          },
          clase: {
            include: {
              profesor: true,
              estilo: true,
              modalidad: true
            }
          }
        },
        orderBy: [
          { fechaEfecto: 'asc' }
        ]
      });

      console.log(`Recibos encontrados: ${recibos.length}`);
      
      // Logs para diagnóstico
      console.log('Recibos antes de filtrar:', recibos.map(r => ({
        id: r.id,
        esClaseSuelta: r.esClaseSuelta,
        claseModalidad: r.clase?.modalidad?.tipo,
        concepto: r.concepto.nombre,
        monto: r.monto
      })));
      
      // Obtener también asistencias a clases sueltas registradas
      const asistenciasClasesSueltas = await prisma.asistencia.findMany({
        where: {
          asistio: true,
          clase: {
            fecha: {
              gte: startDate,
              lte: endDate
            },
            profesorId: Number(profesorId),
            modalidad: {
              tipo: TipoModalidad.SUELTA
            }
          }
        },
        include: {
          alumno: true,
          clase: true
        }
      });

      console.log(`Asistencias a clases sueltas encontradas: ${asistenciasClasesSueltas.length}`);
      
      // Obtener clases sueltas del mes
      const clasesDelMes = await prisma.clase.findMany({
        where: {
          profesorId: Number(profesorId),
          fecha: {
            gte: startDate,
            lte: endDate
          },
          modalidad: {
            tipo: TipoModalidad.SUELTA
          }
        },
        include: {
          asistencias: {
            where: {
              asistio: true
            }
          },
          alumnosSueltos: true
        }
      });
      
      // Separar y procesar los recibos
      const regularRecibos = recibos.filter(recibo => {
        // Un recibo es regular si:
        // 1. NO es una clase suelta (esClaseSuelta === false)
        // 2. NO tiene modalidad SUELTA en su clase
        
        const esClaseSuelta = recibo.esClaseSuelta === true;
        const tieneModalidadSuelta = recibo.clase?.modalidad?.tipo === TipoModalidad.SUELTA;
        const esRegular = !esClaseSuelta && !tieneModalidadSuelta;
        
        console.log(`Recibo #${recibo.id}: esClaseSuelta=${esClaseSuelta}, tieneModalidadSuelta=${tieneModalidadSuelta}, clasificado como ${esRegular ? 'REGULAR' : 'SUELTA'}`);
        
        return esRegular;
      });

      const sueltasRecibos = recibos.filter(recibo => {
        // Un recibo es de clase suelta si:
        // 1. Tiene marcado esClaseSuelta === true, O
        // 2. Tiene una clase con modalidad SUELTA
        
        return recibo.esClaseSuelta === true || 
              (recibo.clase?.modalidad?.tipo === TipoModalidad.SUELTA);
      });

      console.log(`Recibos clasificados: ${regularRecibos.length} regulares y ${sueltasRecibos.length} sueltas`);
      
      // Contar clases sueltas totales
      // 1. Clases registradas con recibos
      const totalClasesSueltasPorRecibos = sueltasRecibos.length;
      
      // 2. Clases registradas con asistencias pero sin recibos
      const clasesConAsistenciasSinRecibos = clasesDelMes
        .filter(clase => 
          clase.asistencias.length > 0 || 
          clase.alumnosSueltos.length > 0
        )
        .length;
      
      // Total de clases sueltas es la suma de ambas
      const totalClasesSueltas = totalClasesSueltasPorRecibos + clasesConAsistenciasSinRecibos;
      
      // Contar asistencias totales a clases sueltas
      const totalAsistenciasClasesSueltas = clasesDelMes.reduce(
        (total, clase) => total + clase.asistencias.length + clase.alumnosSueltos.length, 
        0
      );

      // Calcular totales
      const totalRegular = regularRecibos.reduce((sum, r) => sum + r.monto, 0);
      const totalSueltas = sueltasRecibos.reduce((sum, r) => sum + r.monto, 0);

      // Usar porcentajes personalizados o los del profesor
      const porcentajeRegular = porcentajes?.porcentajeRegular ?? profesor.porcentajePorDefecto;
      const porcentajeSueltas = porcentajes?.porcentajeSueltas ?? profesor.porcentajeClasesSueltasPorDefecto;

      const montoLiquidacionRegular = totalRegular * porcentajeRegular;
      const montoLiquidacionSueltas = totalSueltas * porcentajeSueltas;
      const montoTotalLiquidacion = montoLiquidacionRegular + montoLiquidacionSueltas;

      // Preparar los recibos con sus montos de liquidación
      const recibosConLiquidacion = [
        ...regularRecibos.map(recibo => ({
          ...recibo,
          tipoLiquidacion: 'Regular',
          porcentajeAplicado: porcentajeRegular,
          montoLiquidacion: recibo.monto * porcentajeRegular
        })),
        ...sueltasRecibos.map(recibo => ({
          ...recibo,
          tipoLiquidacion: 'Clase Suelta',
          porcentajeAplicado: porcentajeSueltas,
          montoLiquidacion: recibo.monto * porcentajeSueltas
        }))
      ];

// Crear la liquidación en la base de datos
if (recibosConLiquidacion.length > 0) {
  try {
    const liquidacion = await prisma.liquidacion.create({
      data: {
        fecha: new Date(),
        mes: Number(month),
        anio: Number(year),
        profesor: {
          connect: { id: Number(profesorId) }
        },
        // Campos nuevos
        montoTotalRegular: totalRegular,
        montoTotalSueltas: totalSueltas,
        porcentajeRegular,
        porcentajeSueltas,
        totalLiquidar: montoTotalLiquidacion,
        estado: 'PENDIENTE',
        detalles: {
          create: recibosConLiquidacion.map(recibo => ({
            montoOriginal: recibo.monto,
            porcentaje: recibo.porcentajeAplicado,
            montoLiquidado: recibo.montoLiquidacion,
            recibo: {
              connect: { id: recibo.id }
            }
          }))
        },
        // Usar @ts-ignore para los campos que TypeScript no reconoce
      } as any // Aserción de tipo
    });

    console.log('Liquidación creada:', liquidacion.id);
  } catch (error) {
    console.error('Error al crear liquidación en DB:', error);
    throw new Error('Error al guardar la liquidación');
  }
}
      // Calcular alumnos únicos que tomaron clases sueltas
      const alumnosSueltoIds = new Set();
      
      // Agregar alumnos de recibos de clases sueltas
      sueltasRecibos.forEach(recibo => {
        if (recibo.alumnoId) alumnosSueltoIds.add(recibo.alumnoId);
        if (recibo.alumnoSueltoId) alumnosSueltoIds.add(recibo.alumnoSueltoId);
      });
      
      // Agregar alumnos de asistencias a clases sueltas
      asistenciasClasesSueltas.forEach(asistencia => {
        if (asistencia.alumnoId) {
          alumnosSueltoIds.add(asistencia.alumnoId);
        }
      });
      
      // Agregar alumnos sueltos de clases
      clasesDelMes.forEach(clase => {
        clase.alumnosSueltos.forEach(alumnoSuelto => {
          alumnosSueltoIds.add(`suelto_${alumnoSuelto.id}`);
        });
      });

      const totalAlumnosSueltos = alumnosSueltoIds.size;
      console.log(`Total de alumnos de clases sueltas: ${totalAlumnosSueltos}`);
      console.log(`Total de clases sueltas: ${totalClasesSueltas}`);

      // Preparar respuesta detallada
      const liquidacionData: LiquidacionResponse = {
        regularCount: regularRecibos.length,
        sueltasCount: totalAlumnosSueltos, // Cantidad de alumnos únicos que tomaron clases sueltas
        clasesCount: totalAsistenciasClasesSueltas, // Total de asistencias a clases sueltas
        totalRegular,
        totalSueltas,
        montoLiquidacionRegular,
        montoLiquidacionSueltas,
        recibos: recibosConLiquidacion.map(recibo => ({
          id: recibo.id,
          numeroRecibo: recibo.numeroRecibo,
          fecha: recibo.fecha,
          fechaEfecto: recibo.fechaEfecto,
          monto: recibo.monto,
          montoLiquidacion: recibo.montoLiquidacion,
          porcentajeAplicado: recibo.porcentajeAplicado,
          tipoLiquidacion: recibo.tipoLiquidacion,
          alumno: recibo.alumno || recibo.alumnoSuelto,
          concepto: {
            nombre: recibo.concepto.nombre,
            estilo: recibo.concepto.estilo?.nombre
          },
          clase: recibo.clase ? {
            fecha: recibo.clase.fecha,
            estilo: recibo.clase.estilo.nombre,
            modalidad: recibo.clase.modalidad?.tipo
          } : null
        })),
        periodo,
        detallesPorProfesor: undefined
      };

      return res.status(200).json(liquidacionData);

    } catch (error) {
      console.error('Error al generar liquidación:', error);
      return res.status(500).json({ 
        error: 'Error al generar liquidación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}