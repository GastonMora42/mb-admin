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
          apellido: true
        }
      });
      
      return res.status(200).json(profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return res.status(500).json({ error: 'Error al obtener profesores' });
    }
  }

  if (req.method === 'POST') {
    const { periodo, profesorId, alumnoId } = req.body;

    try {
      // Validación del período
      if (!periodo) {
        return res.status(400).json({ error: 'El período es requerido' });
      }

      // Extraer año y mes del período
      const [year, month] = periodo.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0); // último día del mes

      // Construimos el where dinámicamente
      const where: Prisma.ReciboWhereInput = {
        AND: [
          { fecha: { gte: startDate } },
          { fecha: { lte: endDate } }
        ]
      };

      // Añadimos filtros opcionales
      if (profesorId) {
        where.clase = {
          profesorId: Number(profesorId)
        };
      }

      if (alumnoId) {
        where.alumnoId = Number(alumnoId);
      }

      // Obtenemos los recibos
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
                  apellido: true
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

      // Procesamos los recibos
      const regularRecibos = recibos.filter(r => r.concepto.nombre !== 'Clase Suelta');
      const sueltasRecibos = recibos.filter(r => r.concepto.nombre === 'Clase Suelta');

      const totalRegular = regularRecibos.reduce((sum, r) => sum + r.monto, 0);
      const totalSueltas = sueltasRecibos.reduce((sum, r) => sum + r.monto, 0);

      // Si no hay filtro de profesor, agrupamos por profesor
      let detallesPorProfesor: LiquidacionResponse['detallesPorProfesor'] = {};
      
      if (!profesorId) {
        recibos.forEach(recibo => {
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
              detallesPorProfesor[profesorId].montoLiquidacionSueltas += recibo.monto * 0.8;
            } else {
              detallesPorProfesor[profesorId].totalRegular += recibo.monto;
              detallesPorProfesor[profesorId].montoLiquidacionRegular += recibo.monto * 0.6;
            }
          }
        });
      }

      const montoLiquidacionRegular = totalRegular * 0.6;
      const montoLiquidacionSueltas = totalSueltas * 0.8;

      // Preparamos la respuesta
      const liquidacionData: LiquidacionResponse = {
        regularCount: regularRecibos.length,
        sueltasCount: sueltasRecibos.length,
        totalRegular,
        totalSueltas,
        montoLiquidacionRegular,
        montoLiquidacionSueltas,
        recibos,
        periodo,
        detallesPorProfesor: Object.keys(detallesPorProfesor).length > 0 ? detallesPorProfesor : undefined
      };

      // Guardamos la liquidación en la base de datos si hay recibos
      if (recibos.length > 0) {
        const createData: Prisma.LiquidacionCreateInput = {
          fecha: new Date(),
          mes: Number(month),
          anio: Number(year),
          montoTotal: montoLiquidacionRegular + montoLiquidacionSueltas,
          montoCursos: montoLiquidacionRegular,
          montoClasesSueltas: montoLiquidacionSueltas,
          porcentajeCursos: 0.60,
          porcentajeClasesSueltas: 0.80,
          estado: 'PENDIENTE',
          ...(profesorId ? {
            profesor: {
              connect: {
                id: Number(profesorId)
              }
            }
          } : {}),
          detalles: {
            create: recibos.map(recibo => ({
              montoOriginal: recibo.monto,
              porcentaje: recibo.concepto.nombre === 'Clase Suelta' ? 0.8 : 0.6,
              montoLiquidado: recibo.monto * (recibo.concepto.nombre === 'Clase Suelta' ? 0.8 : 0.6),
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