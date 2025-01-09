import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    
    let whereClause: any = {};
    if (numero) whereClause.numeroRecibo = parseInt(numero as string);
    if (alumnoId) whereClause.alumnoId = parseInt(alumnoId as string);
    if (alumnoSueltoId) whereClause.alumnoSueltoId = parseInt(alumnoSueltoId as string);
    if (conceptoId) whereClause.conceptoId = parseInt(conceptoId as string);
    if (periodo) whereClause.periodoPago = periodo as string;
    if (fueraDeTermino) whereClause.fueraDeTermino = fueraDeTermino === 'true';
    if (esClaseSuelta) whereClause.esClaseSuelta = esClaseSuelta === 'true';
    if (esMesCompleto) whereClause.esMesCompleto = esMesCompleto === 'true';
    if (anulado !== undefined) whereClause.anulado = anulado === 'true';
    
    if (fechaDesde || fechaHasta) {
      whereClause.fecha = {};
      if (fechaDesde) whereClause.fecha.gte = new Date(fechaDesde as string);
      if (fechaHasta) whereClause.fecha.lte = new Date(fechaHasta as string);
    }

    try {
      const recibos = await prisma.recibo.findMany({
        where: whereClause,
        include: { 
          alumno: true,
          alumnoSuelto: {
            include: {
              alumnoRegular: true
            }
          },
          concepto: true,
          pagosDeuda: {
            include: {
              deuda: true
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
        fechaEfecto,
        periodoPago, 
        tipoPago, 
        alumnoId, 
        alumnoSueltoId, 
        conceptoId, 
        esClaseSuelta,
        claseId,
        esMesCompleto,
        deudasAPagar // array de deudas a pagar
      } = req.body;
  
      const result = await prisma.$transaction(async (tx) => {
        // 1. Crear el recibo
        const recibo = await tx.recibo.create({
          data: {
            monto: parseFloat(monto),
            montoOriginal: parseFloat(monto),
            fechaEfecto: new Date(fechaEfecto),
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
            }
          }
        });
  
        // 2. Si hay deudas a pagar, procesarlas
        if (alumnoId && esMesCompleto && deudasAPagar?.length > 0) {
          // Crear los pagos de deuda y actualizar estados
          for (const deuda of deudasAPagar) {
            // Crear el pago
            await tx.pagoDeuda.create({
              data: {
                deudaId: deuda.deudaId,
                reciboId: recibo.id,
                monto: deuda.monto,
                fecha: new Date()
              }
            });
  
            // Actualizar la deuda
            await tx.deuda.update({
              where: { id: deuda.deudaId },
              data: {
                pagada: true,
                fechaPago: new Date()
              }
            });
          }
        }
  
        // Retornar el recibo creado con toda la información actualizada
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
                    estilo: true
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
        error: error instanceof Error ? error.message : 'Error al crear recibo' 
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