import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

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

      // Procesar las deudas para añadir información adicional
      const deudasProcesadas = deudas.map(deuda => {
        const montoPagado = deuda.pagos.reduce((sum, pago) => sum + pago.monto, 0);
        
        return {
          ...deuda,
          periodo: `${deuda.mes}/${deuda.anio}`,
          montoPagado,
          montoPendiente: deuda.monto - montoPagado,
          estaVencida: new Date(deuda.fechaVencimiento) < new Date() && !deuda.pagada,
          pagosInfo: deuda.pagos.map(pago => ({
            fecha: pago.recibo.fecha,
            numeroRecibo: pago.recibo.numeroRecibo,
            monto: pago.monto
          }))
        };
      });

      // Agrupar por período para mejor visualización
      const deudasAgrupadas = deudasProcesadas.reduce((acc, deuda) => {
        const periodo = `${deuda.mes}/${deuda.anio}`;
        if (!acc[periodo]) {
          acc[periodo] = [];
        }
        acc[periodo].push(deuda);
        return acc;
      }, {} as Record<string, typeof deudasProcesadas>);

      res.status(200).json({
        deudas: deudasProcesadas,
        deudasAgrupadas,
        resumen: {
          totalDeuda: deudasProcesadas.reduce((sum, deuda) => 
            sum + (deuda.pagada ? 0 : deuda.montoPendiente), 0),
          cantidadDeudasPendientes: deudasProcesadas.filter(d => !d.pagada).length,
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