// pages/api/liquidaciones.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface LiquidacionResponse {
  regularCount: number;
  sueltasCount: number;
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
  porcentajeCursos: number;
  porcentajeClasesSueltas: number;
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
          AND: [
            { esClaseSuelta: true },
            {
              clase: {
                profesorId: Number(profesorId)
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
              estilo: true
            }
          }
        },
        orderBy: [
          { fechaEfecto: 'asc' }
        ]
      });

      console.log(`Recibos encontrados: ${recibos.length}`);
      // Separar y procesar los recibos
     const regularRecibos = recibos.filter(recibo => {
      // Es un recibo regular si está asociado a un estilo del profesor
      // y no es una clase suelta
      return (
        recibo.concepto.estilo &&
        estilosIds.includes(recibo.concepto.estilo.id) &&
        recibo.concepto.nombre !== 'Clase Suelta'
      );
    });

    const sueltasRecibos = recibos.filter(recibo => {
      // Es una clase suelta si:
      // 1. El concepto es 'Clase Suelta'
      // 2. Está asociado a una clase del profesor
      return (
        recibo.concepto.nombre === 'Clase Suelta' &&
        recibo.clase?.profesorId === Number(profesorId)
      );
    });

    // Calcular totales
    const totalRegular = regularRecibos.reduce((sum, r) => sum + r.monto, 0);
    const totalSueltas = sueltasRecibos.reduce((sum, r) => sum + r.monto, 0);

    // Usar porcentajes personalizados o los del profesor
    const porcentajeCursos = porcentajes?.porcentajeCursos ?? profesor.porcentajePorDefecto;
    const porcentajeClasesSueltas = porcentajes?.porcentajeClasesSueltas ?? profesor.porcentajeClasesSueltasPorDefecto;

    const montoLiquidacionRegular = totalRegular * porcentajeCursos;
    const montoLiquidacionSueltas = totalSueltas * porcentajeClasesSueltas;

    // Preparar los recibos con sus montos de liquidación
    const recibosConLiquidacion = [
      ...regularRecibos.map(recibo => ({
        ...recibo,
        tipoLiquidacion: 'Regular',
        porcentajeAplicado: porcentajeCursos,
        montoLiquidacion: recibo.monto * porcentajeCursos
      })),
      ...sueltasRecibos.map(recibo => ({
        ...recibo,
        tipoLiquidacion: 'Clase Suelta',
        porcentajeAplicado: porcentajeClasesSueltas,
        montoLiquidacion: recibo.monto * porcentajeClasesSueltas
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
            montoTotal: montoLiquidacionRegular + montoLiquidacionSueltas,
            montoCursos: montoLiquidacionRegular,
            montoClasesSueltas: montoLiquidacionSueltas,
            porcentajeCursos,
            porcentajeClasesSueltas,
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
            }
          }
        });

        console.log('Liquidación creada:', liquidacion.id);
      } catch (error) {
        console.error('Error al crear liquidación en DB:', error);
        throw new Error('Error al guardar la liquidación');
      }
    }

    // Preparar respuesta detallada
    const liquidacionData: LiquidacionResponse = {
      regularCount: regularRecibos.length,
      sueltasCount: sueltasRecibos.length,
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
          estilo: recibo.clase.estilo.nombre
        } : null
      })),
      periodo,
      detallesPorProfesor: undefined // Ya no necesitamos esto para liquidaciones individuales
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