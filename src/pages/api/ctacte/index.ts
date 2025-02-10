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
                concepto: {
                  select: {
                    id: true,
                    nombre: true,
                    monto: true,
                    esInscripcion: true,
                    activo: true
                  }
                },
                pagos: {
                  include: {
                    recibo: {
                      select: {
                        id: true,
                        numeroRecibo: true,
                        fecha: true,
                        monto: true,
                        periodoPago: true,
                        anulado: true,
                        tipoPago: true
                      }
                    }
                  }
                }
              },
              orderBy: [
                { concepto: { esInscripcion: 'desc' } }, // Inscripciones primero
                { anio: 'asc' },
                { mes: 'asc' }
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

          // Antes de procesar las deudas
console.log('Deudas sin procesar:', alumnoInfo.deudas);

const deudasProcesadas = alumnoInfo.deudas.map(deuda => {
  // Log para cada deuda
  console.log(`Procesando deuda ID ${deuda.id}:`, {
    monto: deuda.monto,
    pagos: deuda.pagos
  });

  const pagosValidos = deuda.pagos.filter(pago => !pago.recibo.anulado);
  const montoPagado = pagosValidos.reduce((sum, pago) => sum + pago.monto, 0);
  const estaPagada = montoPagado >= deuda.monto;

  // Log del resultado
  console.log(`Resultado deuda ID ${deuda.id}:`, {
    montoPagado,
    estaPagada
  });

  return {
    ...deuda,
    montoPagado,
    saldoPendiente: deuda.monto - montoPagado,
    pagada: estaPagada,
    pagosDetalle: pagosValidos.map(pago => ({
      id: pago.id,
      monto: pago.monto,
      fecha: pago.recibo.fecha,
      numeroRecibo: pago.recibo.numeroRecibo
    }))
  };
});

// Log final
console.log('Deudas procesadas:', deudasProcesadas);
  

const estadisticas = {
  totalPagado: todosLosRecibos
    .filter(r => !r.anulado)
    .reduce((sum, recibo) => sum + recibo.monto, 0),
  deudaTotal: deudasProcesadas
    .filter(d => !d.pagada)
    .reduce((sum, deuda) => sum + deuda.saldoPendiente, 0),
  cantidadDeudas: deudasProcesadas.filter(d => !d.pagada).length,
  deudasPagadas: deudasProcesadas.filter(d => d.pagada).length,
  estilosActivos: alumnoInfo.alumnoEstilos.length,
  ultimoPago: todosLosRecibos.find(r => !r.anulado)?.fecha || null,
  descuentosActivos: alumnoInfo.descuentosVigentes.map(dv => ({
    tipo: dv.descuento.esAutomatico ? 'Automático' : 'Manual',
    porcentaje: dv.descuento.porcentaje
  })),
  inscripcion: {
    pagada: alumnoInfo.inscripcionPagada,
    fechaPago: alumnoInfo.fechaPagoInscripcion,
    deuda: deudasProcesadas.find(d => d.concepto?.esInscripcion && !d.pagada)?.monto || 0
  }
};
        // Verificar estado de pagos
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        const deudasMesActual = alumnoInfo.deudas.filter(
          d => d.mes === mesActual.toString() && d.anio === anioActual && !d.pagada
        );
        const estadoPagos = {
          alDia: deudasProcesadas.every(deuda => 
            deuda.pagada || (
              new Date(deuda.fechaVencimiento) > new Date()
            )
          ),
          mesesAdeudados: deudasProcesadas
            .filter(d => !d.pagada)
            .map(d => ({
              periodo: `${d.mes}/${d.anio}`,
              monto: d.saldoPendiente,
              vencida: new Date(d.fechaVencimiento) < new Date()
            }))
            .sort((a, b) => {
              const [mesA, anioA] = a.periodo.split('/').map(Number);
              const [mesB, anioB] = b.periodo.split('/').map(Number);
              return anioA - anioB || mesA - mesB;
            })
        };
        return res.status(200).json({
          alumnoInfo: {
            ...alumnoInfo,
            deudas: deudasProcesadas
          },
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