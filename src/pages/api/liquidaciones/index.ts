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
          porcentajeClasesSueltasPorDefecto: true
        }
      });
      
      return res.status(200).json(profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return res.status(500).json({ error: 'Error al obtener profesores' });
    }
  }

  if (req.method === 'POST') {
    const { 
      periodo, 
      profesorId, 
      alumnoId, 
      porcentajes 
    } = req.body as {
      periodo: string;
      profesorId?: number;
      alumnoId?: number;
      porcentajes: PorcentajesPersonalizados;
    };

    try {
      // Validación del período
      if (!periodo) {
        return res.status(400).json({ error: 'El período es requerido' });
      }

      // Extraer año y mes del período
      const [year, month] = periodo.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      // Construir where dinámicamente
      const where: Prisma.ReciboWhereInput = {
        AND: [
          { fecha: { gte: startDate } },
          { fecha: { lte: endDate } },
          { anulado: false }  // Solo recibos no anulados
        ]
      };

      if (profesorId) {
        where.clase = {
          profesorId: Number(profesorId)
        };
      }

      if (alumnoId) {
        where.alumnoId = Number(alumnoId);
      }

      // Obtener recibos con toda la información necesaria
      const recibos = await prisma.recibo.findMany({
        where,
        include: {
          alumno: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true
            }
          },
          concepto: {
            select: {
              id: true,
              nombre: true,
              monto: true
            }
          },
          clase: {
            include: {
              profesor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  porcentajePorDefecto: true,
                  porcentajeClasesSueltasPorDefecto: true
                }
              },
              estilo: true
            }
          }
        },
        orderBy: [
          { fecha: 'asc' }
        ]
      });

      // Procesar recibos con los porcentajes personalizados
      const regularRecibos = recibos.filter(r => r.concepto.nombre !== 'Clase Suelta');
      const sueltasRecibos = recibos.filter(r => r.concepto.nombre === 'Clase Suelta');

      const totalRegular = regularRecibos.reduce((sum, r) => sum + r.monto, 0);
      const totalSueltas = sueltasRecibos.reduce((sum, r) => sum + r.monto, 0);

      const montoLiquidacionRegular = totalRegular * porcentajes.porcentajeCursos;
      const montoLiquidacionSueltas = totalSueltas * porcentajes.porcentajeClasesSueltas;

      // Calcular montos de liquidación para cada recibo
      const recibosConLiquidacion = recibos.map(recibo => ({
        ...recibo,
        montoLiquidacion: recibo.concepto.nombre === 'Clase Suelta'
          ? recibo.monto * porcentajes.porcentajeClasesSueltas
          : recibo.monto * porcentajes.porcentajeCursos
      }));

      // Agrupar por profesor si no hay filtro de profesor
      let detallesPorProfesor: LiquidacionResponse['detallesPorProfesor'] = {};
      
      if (!profesorId) {
        recibosConLiquidacion.forEach(recibo => {
          if (recibo.clase?.profesor) {
            const profesorId = recibo.clase.profesor.id;
            const profesorNombre = `${recibo.clase.profesor.apellido}, ${recibo.clase.profesor.nombre}`;
            
            if (!detallesPorProfesor[profesorId]) {
              detallesPorProfesor[profesorId] = {
                nombre: profesorNombre,
                recibos: [],
                totalRegular: 0,
                totalSueltas: 0,
                montoLiquidacionRegular: 0,
                montoLiquidacionSueltas: 0
              };
            }

            detallesPorProfesor[profesorId].recibos.push(recibo);
            
            if (recibo.concepto.nombre === 'Clase Suelta') {
              detallesPorProfesor[profesorId].totalSueltas += recibo.monto;
              detallesPorProfesor[profesorId].montoLiquidacionSueltas += recibo.montoLiquidacion;
            } else {
              detallesPorProfesor[profesorId].totalRegular += recibo.monto;
              detallesPorProfesor[profesorId].montoLiquidacionRegular += recibo.montoLiquidacion;
            }
          }
        });
      }

      // Crear la liquidación en la base de datos
      if (recibos.length > 0) {
        const createData: Prisma.LiquidacionCreateInput = {
          fecha: new Date(),
          mes: Number(month),
          anio: Number(year),
          montoTotal: montoLiquidacionRegular + montoLiquidacionSueltas,
          montoCursos: montoLiquidacionRegular,
          montoClasesSueltas: montoLiquidacionSueltas,
          porcentajeCursos: porcentajes.porcentajeCursos,
          porcentajeClasesSueltas: porcentajes.porcentajeClasesSueltas,
          estado: 'PENDIENTE',
          ...(profesorId ? {
            profesor: {
              connect: {
                id: Number(profesorId)
              }
            }
          } : {}),
          detalles: {
            create: recibosConLiquidacion.map(recibo => ({
              montoOriginal: recibo.monto,
              porcentaje: recibo.concepto.nombre === 'Clase Suelta' 
                ? porcentajes.porcentajeClasesSueltas 
                : porcentajes.porcentajeCursos,
              montoLiquidado: recibo.montoLiquidacion,
              recibo: {
                connect: {
                  id: recibo.id
                }
              }
            }))
          }
        };

        await prisma.liquidacion.create({
          data: createData
        });
      }

      // Preparar respuesta
      const liquidacionData: LiquidacionResponse = {
        regularCount: regularRecibos.length,
        sueltasCount: sueltasRecibos.length,
        totalRegular,
        totalSueltas,
        montoLiquidacionRegular,
        montoLiquidacionSueltas,
        recibos: recibosConLiquidacion,
        periodo,
        detallesPorProfesor: Object.keys(detallesPorProfesor).length > 0 
          ? detallesPorProfesor 
          : undefined
      };

      return res.status(200).json(liquidacionData);
    } catch (error) {
      console.error('Error al generar liquidación:', error);
      return res.status(500).json({ 
        error: 'Error al generar liquidación',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}