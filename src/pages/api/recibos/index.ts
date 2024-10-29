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
    
    // Filtro por rango de fechas
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
  } else if (req.method === 'POST') {
    try {
      const { 
        monto, 
        montoOriginal, // Asegúrate de recibir esto
        descuento,
        periodoPago,
        tipoPago,
        alumnoId,
        alumnoSueltoId,
        conceptoId,
        fechaEfecto,
        fueraDeTermino,
        esClaseSuelta,
        esMesCompleto,
        deudasAPagar 
      } = req.body;

      const reciboData = {
        monto: parseFloat(monto),
        montoOriginal: parseFloat(montoOriginal), // Asegúrate de incluirlo
        descuento: descuento ? parseFloat(descuento) : null,
        periodoPago,
        tipoPago,
        fechaEfecto: new Date(fechaEfecto),
        fueraDeTermino: Boolean(fueraDeTermino),
        esClaseSuelta: Boolean(esClaseSuelta),
        esMesCompleto: Boolean(esMesCompleto),
        concepto: {
          connect: { id: parseInt(conceptoId) }
        },
        ...(alumnoId ? {
          alumno: { connect: { id: parseInt(alumnoId) } }
        } : {}),
        ...(alumnoSueltoId ? {
          alumnoSuelto: { connect: { id: parseInt(alumnoSueltoId) } }
        } : {})
      };

      const recibo = await prisma.$transaction(async (prisma) => {
        const nuevoRecibo = await prisma.recibo.create({
          data: reciboData,
          include: {
            alumno: true,
            alumnoSuelto: {
              include: {
                alumnoRegular: true
              }
            },
            concepto: true,
            pagosDeuda: true
          }
        });

        // Crear pagos de deuda si existen
        if (deudasAPagar && deudasAPagar.length > 0) {
          for (const { deudaId, monto } of deudasAPagar) {
            await prisma.pagoDeuda.create({
              data: {
                deudaId: parseInt(deudaId),
                reciboId: nuevoRecibo.id,
                monto: parseFloat(monto),
              }
            });

            // Actualizar estado de la deuda
            const pagosDeuda = await prisma.pagoDeuda.findMany({
              where: { deudaId: parseInt(deudaId) },
              select: { monto: true }
            });

            const totalPagado = pagosDeuda.reduce((sum, pago) => sum + pago.monto, 0);
            const deuda = await prisma.deuda.findUnique({
              where: { id: parseInt(deudaId) }
            });

            if (deuda && totalPagado >= deuda.monto) {
              await prisma.deuda.update({
                where: { id: parseInt(deudaId) },
                data: { 
                  pagada: true,
                  fechaPago: new Date()
                }
              });
            }
          }
        }

        return nuevoRecibo;
      });

      // Procesar alumno regular si existe
      if (recibo.alumnoSuelto && recibo.alumnoSuelto.alumnoRegular) {
        recibo.alumno = recibo.alumnoSuelto.alumnoRegular;
        recibo.alumnoSuelto = null;
      }

      res.status(201).json(recibo);
    } catch (error) {
      console.error('Error al crear recibo:', error);
      res.status(400).json({ error: 'Error al crear recibo' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de recibo no proporcionado o inválido' });
    }

    try {
      const reciboId = parseInt(id);
      // En lugar de eliminar, marcar como anulado
      await prisma.recibo.update({
        where: { id: reciboId },
        data: { 
          anulado: true,
          motivoAnulacion: 'Recibo anulado por el usuario'
        }
      });
      
      res.status(200).json({ message: 'Recibo anulado exitosamente' });
    } catch (error) {
      console.error('Error al anular recibo:', error);
      res.status(500).json({ error: 'Error al anular recibo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}