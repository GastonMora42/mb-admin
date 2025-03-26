// pages/api/ctacte.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { TipoModalidad } from '@prisma/client'

// Definir tipos para mejorar el tipado
type PagoDeuda = {
  id: number;
  deudaId: number;
  reciboId: number;
  monto: number;
  fecha: Date;
  createdAt: Date;
  updatedAt: Date;
  recibo: {
    id: number;
    numeroRecibo: number;
    fecha: Date;
    monto: number;
    periodoPago: string;
    anulado: boolean;
    tipoPago: string;
  };
};

type Deuda = {
  id: number;
  alumnoId: number;
  estiloId: number | null;
  monto: number;
  mes: string;
  anio: number;
  pagada: boolean;
  fechaVencimiento: Date;
  conceptoId: number | null;
  tipoDeuda: TipoModalidad;
  cantidadClases: number | null;
  createdAt: Date;
  updatedAt: Date;
  estilo: any | null;
  concepto: {
    id: number;
    nombre: string;
    montoRegular: number;
    montoSuelto: number;
    esInscripcion: boolean;
  } | null;
  pagos: PagoDeuda[];
  montoPagado?: number;
  saldoPendiente?: number;
  pagosDetalle?: any[];
};

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
                    montoRegular: true,
                    montoSuelto: true,
                    esInscripcion: true
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
                { anio: 'asc' },
                { mes: 'asc' }
              ]
            },
            alumnoEstilos: {
              where: { activo: true },
              include: {
                estilo: true,
                modalidad: true
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

// Procesar las deudas para manejar estiloId null
const deudasProcesadas = alumnoInfo.deudas.map((deuda) => {
  // Procesar los pagos válidos
  const pagosValidos = deuda.pagos.filter(pago => !pago.recibo.anulado);
  const montoPagado = pagosValidos.reduce((sum: number, pago: PagoDeuda) => sum + pago.monto, 0);
  const estaPagada = montoPagado >= deuda.monto;

  // Formatear los detalles de pago
  const pagosDetalle = pagosValidos.map(pago => ({
    id: pago.id,
    monto: pago.monto,
    fecha: pago.recibo.fecha,
    numeroRecibo: pago.recibo.numeroRecibo
  }));

  // Normalizar los valores de concepto para evitar errores de tipos
  const concepto = deuda.concepto
    ? {
        ...deuda.concepto,
        montoRegular: deuda.concepto.montoRegular ?? 0, // Convertir null a 0
        montoSuelto: deuda.concepto.montoSuelto ?? 0,   // Convertir null a 0
      }
    : null;

  // Construir objeto con información adicional para la UI
  return {
    ...deuda,
    montoPagado,
    saldoPendiente: deuda.monto - montoPagado,
    pagada: estaPagada,
    pagosDetalle,
    concepto, // Usar el objeto concepto corregido
    // Agregar información de visualización para deudas sin estilo
    estiloNombre: deuda.estilo ? deuda.estilo.nombre : 
                  (concepto?.esInscripcion ? 'Inscripción' : 'Sin estilo'),
    conceptoNombre: concepto ? concepto.nombre : 
                    (deuda.tipoDeuda === 'SUELTA' ? 'Clase suelta' : 'Mensualidad')
  };
});

        // Definir la fecha de inscripción e inscripción pagada basándonos en deudas
        const deudaInscripcion = deudasProcesadas.find((d: any) => 
          d.concepto?.esInscripcion === true
        );
        
        const inscripcionPagada = deudaInscripcion?.pagada || false;
        const fechaPagoInscripcion = deudaInscripcion?.pagada 
          ? deudaInscripcion.pagosDetalle?.[0]?.fecha || null 
          : null;

        // Estadísticas
        const estadisticas = {
          totalPagado: todosLosRecibos
            .filter(r => !r.anulado)
            .reduce((sum: number, recibo: any) => sum + recibo.monto, 0),
          deudaTotal: deudasProcesadas
            .filter((d: any) => !d.pagada)
            .reduce((sum: number, deuda: any) => sum + deuda.saldoPendiente, 0),
          cantidadDeudas: deudasProcesadas.filter((d: any) => !d.pagada).length,
          deudasPagadas: deudasProcesadas.filter((d: any) => d.pagada).length,
          estilosActivos: alumnoInfo.alumnoEstilos.length,
          ultimoPago: todosLosRecibos.find(r => !r.anulado)?.fecha || null,
          descuentosActivos: alumnoInfo.descuentosVigentes.map(dv => ({
            tipo: dv.descuento.esAutomatico ? 'Automático' : 'Manual',
            porcentaje: dv.descuento.porcentaje
          })),
          inscripcion: {
            pagada: inscripcionPagada,
            fechaPago: fechaPagoInscripcion,
            deuda: deudasProcesadas.find((d: any) => d.concepto?.esInscripcion && !d.pagada)?.monto || 0
          }
        };

        // Estado de pagos
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        
        const estadoPagos = {
          alDia: deudasProcesadas.every((deuda: any) => 
            deuda.pagada || (
              new Date(deuda.fechaVencimiento) > new Date()
            )
          ),
          mesesAdeudados: deudasProcesadas
            .filter((d: any) => !d.pagada)
            .map((d: any) => ({
              periodo: `${d.mes}/${d.anio}`,
              monto: d.saldoPendiente,
              vencida: new Date(d.fechaVencimiento) < new Date(),
              estilo: d.estilo?.nombre || d.estiloNombre || 'Sin estilo',
              tipo: d.tipoDeuda,
              concepto: d.concepto?.nombre || d.conceptoNombre || 'Sin concepto',
              clases: d.cantidadClases || 'Mensual'
            }))
            .sort((a: any, b: any) => {
              const [mesA, anioA] = a.periodo.split('/').map(Number);
              const [mesB, anioB] = b.periodo.split('/').map(Number);
              return anioA - anioB || mesA - mesB;
            })
        };
        
        return res.status(200).json({
          alumnoInfo: {
            ...alumnoInfo,
            // Agregamos estos campos calculados que ya no existen en el modelo
            inscripcionPagada,
            fechaPagoInscripcion,
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