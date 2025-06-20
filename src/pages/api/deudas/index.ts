import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { TipoModalidad } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { alumnoId, pagada } = req.query;
    
    try {
      if (!alumnoId) {
        return res.status(400).json({ error: 'Se requiere alumnoId' });
      }

      const deudas = await prisma.deuda.findMany({
        where: {
          alumnoId: parseInt(alumnoId as string),
          pagada: pagada ? pagada === 'true' : undefined,
        },
        include: {
          estilo: {
            select: {
              id: true,
              nombre: true,
              importe: true,
              descripcion: true
            }
          },
          concepto: {
            select: {
              id: true,
              nombre: true,
              montoRegular: true,
              montoSuelto: true,
              esInscripcion: true
            }
          },
          pagos: {
            include: {
              recibo: {
                select: {
                  numeroRecibo: true,
                  fecha: true,
                  monto: true,
                  periodoPago: true
                }
              }
            }
          },
          alumno: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              alumnoEstilos: {
                where: {
                  activo: true
                },
                include: {
                  estilo: true
                }
              }
            }
          }
        },
        orderBy: [
          { anio: 'asc' },
          { mes: 'asc' }
        ]
      });
      
      // En el procesamiento de deudas, incluir la información de modalidad (regular o suelta)
      const deudasProcesadas = deudas.map(deuda => {
        const montoPagado = deuda.pagos ? deuda.pagos.reduce((sum: number, pago: any) => sum + pago.monto, 0) : 0;
        
        // Determinar si es una inscripción basado en el concepto
        const esInscripcion = deuda.concepto ? deuda.concepto.esInscripcion : false;
        
        // Determinar el tipo de modalidad para mostrar
        const tipoModalidadText = deuda.tipoDeuda === TipoModalidad.REGULAR ? 'Mensual' : 'Clase Suelta';
        
        return {
          ...deuda,
          periodo: esInscripcion ? 'INSCRIPCIÓN' : `${deuda.mes}/${deuda.anio}`,
          montoPagado,
          montoPendiente: deuda.monto - montoPagado,
          estaVencida: new Date(deuda.fechaVencimiento) < new Date() && !deuda.pagada,
          esInscripcion,
          tipoModalidad: tipoModalidadText,
          cantidadClases: deuda.cantidadClases || (deuda.tipoDeuda === TipoModalidad.REGULAR ? null : 1),
          pagosInfo: deuda.pagos ? deuda.pagos.map((pago: any) => ({
            fecha: pago.recibo.fecha,
            numeroRecibo: pago.recibo.numeroRecibo,
            monto: pago.monto
          })) : []
        };
      });
      
      // En el agrupamiento, manejar las inscripciones y tipos de modalidad
      const deudasAgrupadas = deudasProcesadas.reduce((acc: Record<string, any[]>, deuda: any) => {
        let periodo;
        if (deuda.esInscripcion) {
          periodo = 'INSCRIPCIÓN';
        } else {
          // Incluir la modalidad en el periodo para diferenciar
          periodo = `${deuda.mes}/${deuda.anio} - ${deuda.tipoModalidad}`;
        }
        
        if (!acc[periodo]) {
          acc[periodo] = [];
        }
        acc[periodo].push(deuda);
        return acc;
      }, {});

      res.status(200).json({
        deudas: deudasProcesadas,
        deudasAgrupadas,
        resumen: {
          totalDeuda: deudasProcesadas.reduce((sum: number, deuda: any) => 
            sum + (deuda.pagada ? 0 : deuda.montoPendiente), 0),
          cantidadDeudasPendientes: deudasProcesadas.filter((d: any) => !d.pagada).length,
          periodosMasAntiguos: Object.keys(deudasAgrupadas).slice(0, 3)
        }
      });

    } catch (error) {
      console.error('Error fetching deudas:', error);
      res.status(500).json({ 
        error: 'Error al obtener deudas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}