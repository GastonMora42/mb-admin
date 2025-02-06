//src/pages/api/recibos/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { PrinterService } from '@/lib/printer/printer.service'
import { getArgentinaDateTime } from '@/utils/dateUtils';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumentar límite de tamaño
    },
    responseLimit: '10mb', // Aumentar límite de respuesta
    externalResolver: true, // Permitir resolución externa
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setTimeout(30000); // 30 segundos
  if (req.method === 'GET') {
    const { 
      numero, 
      alumnoId, 
      alumnoSueltoId, 
      conceptoId, 
      periodo, 
      fueraDeTermino, 
      esClaseSuelta,
      esMesCompleto,
      fechaDesde,
      fechaHasta,
      anulado
    } = req.query;
    
    interface DateRange {
      gte?: Date;
      lte?: Date;
    }
    
    interface WhereClause {
      numeroRecibo?: number;
      alumnoId?: number;
      alumnoSueltoId?: number;
      conceptoId?: number;
      periodoPago?: string;
      fueraDeTermino?: boolean;
      esClaseSuelta?: boolean;
      esMesCompleto?: boolean;
      anulado?: boolean;
      fecha?: DateRange;
    }
    
    const whereClause: WhereClause = {};
    
    if (numero) {
      whereClause.numeroRecibo = parseInt(numero.toString(), 10);
    }
    
    if (alumnoId) {
      whereClause.alumnoId = parseInt(alumnoId.toString(), 10);
    }
    
    if (alumnoSueltoId) {
      whereClause.alumnoSueltoId = parseInt(alumnoSueltoId.toString(), 10);
    }
    
    if (conceptoId) {
      whereClause.conceptoId = parseInt(conceptoId.toString(), 10);
    }
    
    if (periodo) {
      whereClause.periodoPago = periodo.toString();
    }
    
    if (fueraDeTermino) {
      whereClause.fueraDeTermino = fueraDeTermino === 'true';
    }
    
    if (esClaseSuelta) {
      whereClause.esClaseSuelta = esClaseSuelta === 'true';
    }
    
    if (esMesCompleto) {
      whereClause.esMesCompleto = esMesCompleto === 'true';
    }
    
    if (anulado !== undefined) {
      whereClause.anulado = anulado === 'true';
    }
    
    if (fechaDesde || fechaHasta) {
      whereClause.fecha = {};
      if (fechaDesde) {
        whereClause.fecha.gte = new Date(fechaDesde.toString());
      }
      if (fechaHasta) {
        whereClause.fecha.lte = new Date(fechaHasta.toString());
      }
    }
    
    try {
      const recibos = await prisma.recibo.findMany({
        where: whereClause,
        include: { 
          alumno: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              email: true,
              telefono: true,
              activo: true,
              inscripcionPagada: true,
              fechaPagoInscripcion: true
            }
          },
          alumnoSuelto: {
            include: {
              alumnoRegular: true
            }
          },
          concepto: {
            include: {
              estilo: true
            }
          },
          pagosDeuda: {
            include: {
              deuda: {
                include: {
                  estilo: true,
                  concepto: {
                    select: {
                      id: true,
                      nombre: true,
                      monto: true,
                      esInscripcion: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { fecha: 'desc' }
      });

      const procesedRecibos = recibos.map(recibo => {
        if (recibo.alumnoSuelto && recibo.alumnoSuelto.alumnoRegular) {
          return {
            ...recibo,
            alumno: recibo.alumnoSuelto.alumnoRegular,
            alumnoSuelto: null
          };
        }
        return recibo;
      });

      res.status(200).json(procesedRecibos);
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      res.status(500).json({ error: 'Error al obtener recibos' });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const { 
        monto,
        montoOriginal,
        descuento,
        periodoPago, 
        tipoPago, 
        alumnoId, 
        alumnoSueltoId, 
        conceptoId, 
        esClaseSuelta,
        claseId,
        esMesCompleto,
        deudasAPagar
      } = req.body;
   
      const fechaArgentina = getArgentinaDateTime();
      const printerService = new PrinterService();
   
      const result = await prisma.$transaction(async (tx) => {
        const recibo = await tx.recibo.create({
          data: {
            monto: parseFloat(monto),
            montoOriginal: parseFloat(montoOriginal || monto),
            descuento: descuento ? parseFloat(descuento) : null,
            fecha: fechaArgentina,
            fechaEfecto: fechaArgentina,
            periodoPago,
            tipoPago,
            esClaseSuelta,
            esMesCompleto,
            concepto: { connect: { id: parseInt(conceptoId) } },
            ...(esClaseSuelta && claseId && {
              clase: { connect: { id: parseInt(claseId) } }
            }),
            ...(alumnoId ? {
              alumno: { connect: { id: parseInt(alumnoId) } }
            } : {
              alumnoSuelto: { connect: { id: parseInt(alumnoSueltoId) } }
            })
          },
          include: {
            alumno: true,
            alumnoSuelto: true,
            concepto: {
              include: {
                estilo: {
                  include: { profesor: true }
                }
              }
            },
            clase: {
              include: {
                profesor: true,
                estilo: true
              }
            },
            pagosDeuda: {
              include: {
                deuda: {
                  include: {
                    estilo: true,
                    concepto: true
                  }
                }
              }
            }
          }
        });
   
        if (alumnoId && deudasAPagar?.length > 0) {
          await Promise.all(deudasAPagar.map(async (deuda: { deudaId: any; monto: any; }) => {
            const deudaOriginal = await tx.deuda.findUnique({
              where: { id: deuda.deudaId },
              include: { concepto: true }
            });
   
            await tx.pagoDeuda.create({
              data: {
                deudaId: deuda.deudaId,
                reciboId: recibo.id,
                monto: deuda.monto,
                fecha: fechaArgentina
              }
            });
            
            await tx.deuda.update({
              where: { id: deuda.deudaId },
              data: {
                pagada: true,
                fechaPago: fechaArgentina
              }
            });
   
            if (deudaOriginal?.concepto?.esInscripcion) {
              await tx.alumno.update({
                where: { id: parseInt(alumnoId) },
                data: {
                  inscripcionPagada: true,
                  fechaPagoInscripcion: fechaArgentina
                }
              });
            }
          }));
        }
   
        // Intentar imprimir fuera de la transacción principal
        Promise.race([
          printerService.printReceipt(recibo),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de impresión')), 8000))
        ]).catch(error => {
          console.error('Error en impresión:', error);
        });
   
        return await tx.recibo.findUnique({
          where: { id: recibo.id },
          include: {
            alumno: true,
            alumnoSuelto: true,
            concepto: {
              include: {
                estilo: {
                  include: { profesor: true }
                }
              }
            },
            clase: {
              include: {
                profesor: true,
                estilo: true
              }
            },
            pagosDeuda: {
              include: {
                deuda: {
                  include: {
                    estilo: true,
                    concepto: true
                  }
                }
              }
            }
          }
        });
      });
   
      return res.status(201).json(result);
   
    } catch (error) {
      console.error('Error al crear recibo:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error al crear recibo',
        details: error instanceof Error ? error.stack : undefined
      });
    }
   }
  
  else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de recibo no proporcionado o inválido' });
    }

    try {
      const reciboId = parseInt(id);
      
      await prisma.$transaction(async (prisma) => {
        // Obtener pagos de deuda asociados
        const pagosDeuda = await prisma.pagoDeuda.findMany({
          where: { reciboId },
          include: { deuda: true }
        });

        // Revertir los pagos de deuda
        await Promise.all(pagosDeuda.map(async (pago) => {
          // Actualizar la deuda a no pagada
          await prisma.deuda.update({
            where: { id: pago.deudaId },
            data: {
              pagada: false,
              fechaPago: null
            }
          });

          // Eliminar el pago
          await prisma.pagoDeuda.delete({
            where: { id: pago.id }
          });
        }));

        // Marcar el recibo como anulado
        await prisma.recibo.update({
          where: { id: reciboId },
          data: { 
            anulado: true,
            motivoAnulacion: 'Recibo anulado por el usuario'
          }
        });
      });
      
      res.status(200).json({ message: 'Recibo anulado exitosamente' });
    } catch (error) {
      console.error('Error al anular recibo:', error);
      res.status(500).json({ error: 'Error al anular recibo' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}