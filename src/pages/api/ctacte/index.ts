// pages/api/ctacte.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { query, alumnoId } = req.query;

    try {
      if (query) {
        // Buscar alumnos regulares y sueltos
        const alumnos = await prisma.alumno.findMany({
          where: {
            OR: [
              { nombre: { contains: query as string, mode: 'insensitive' } },
              { apellido: { contains: query as string, mode: 'insensitive' } },
            ],
          },
          include: {
            ctaCte: true,
            deudas: {
              where: {
                pagada: false
              }
            }
          },
          take: 10,
        });

        const alumnosSueltos = await prisma.alumnoSuelto.findMany({
          where: {
            OR: [
              { nombre: { contains: query as string, mode: 'insensitive' } },
              { apellido: { contains: query as string, mode: 'insensitive' } },
            ],
            alumnoRegularId: null,
          },
          take: 10,
        });

        return res.status(200).json([...alumnos, ...alumnosSueltos]);
      } else if (alumnoId) {
        // Obtener información completa del alumno
        const alumnoInfo = await prisma.alumno.findUnique({
          where: { id: parseInt(alumnoId as string) },
          include: {
            ctaCte: true,
            deudas: {
              include: {
                estilo: true,
                pagos: {
                  include: {
                    recibo: true
                  }
                }
              },
              orderBy: [
                { anio: 'desc' },
                { mes: 'desc' }
              ]
            },
            alumnoEstilos: {
              where: { activo: true },
              include: {
                estilo: true
              }
            },
            descuentosVigentes: {
              where: { activo: true },
              include: {
                descuento: true
              }
            }
          }
        });

        if (!alumnoInfo) {
          return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        // Buscar todos los recibos (regulares y sueltos)
        const recibosRegulares = await prisma.recibo.findMany({
          where: { 
            alumnoId: parseInt(alumnoId as string),
            anulado: false
          },
          include: {
            alumno: true,
            concepto: true,
            pagosDeuda: {
              include: {
                deuda: {
                  include: {
                    estilo: true
                  }
                }
              }
            }
          },
          orderBy: { fecha: 'desc' },
        });

        const recibosSueltos = await prisma.recibo.findMany({
          where: { 
            OR: [
              { alumnoSueltoId: parseInt(alumnoId as string) },
              { alumnoSuelto: { alumnoRegularId: parseInt(alumnoId as string) } }
            ],
            anulado: false
          },
          include: {
            alumnoSuelto: true,
            concepto: true
          },
          orderBy: { fecha: 'desc' },
        });

        const todosLosRecibos = [...recibosRegulares, ...recibosSueltos]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        // Calcular estadísticas y totales
        const estadisticas = {
          totalPagado: todosLosRecibos.reduce((sum, recibo) => sum + recibo.monto, 0),
          deudaTotal: alumnoInfo.deudas
            .filter(d => !d.pagada)
            .reduce((sum, deuda) => sum + deuda.monto, 0),
          cantidadDeudas: alumnoInfo.deudas.filter(d => !d.pagada).length,
          estilosActivos: alumnoInfo.alumnoEstilos.length,
          ultimoPago: todosLosRecibos[0]?.fecha || null,
          descuentosActivos: alumnoInfo.descuentosVigentes.map(dv => ({
            tipo: dv.descuento.esAutomatico ? 'Automático' : 'Manual',
            porcentaje: dv.descuento.porcentaje
          }))
        };

        // Verificar estado de pagos
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        const deudasMesActual = alumnoInfo.deudas.filter(
          d => d.mes === mesActual.toString() && d.anio === anioActual && !d.pagada
        );
        const estadoPagos = {
          alDia: deudasMesActual.length === 0,
          mesesAdeudados: [...new Set(alumnoInfo.deudas
            .filter(d => !d.pagada)
            .map(d => `${d.mes}/${d.anio}`))]
        };

        return res.status(200).json({
          alumnoInfo,
          recibos: todosLosRecibos,
          estadisticas,
          estadoPagos
        });

      } else {
        return res.status(400).json({ error: 'Parámetros inválidos' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}