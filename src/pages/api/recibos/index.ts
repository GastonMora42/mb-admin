import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { numero, alumnoId, alumnoSueltoId, conceptoId, periodo, fueraDeTermino, esClaseSuelta } = req.query;
    
    let whereClause: any = {};
    if (numero) whereClause.numeroRecibo = parseInt(numero as string);
    if (alumnoId) whereClause.alumnoId = parseInt(alumnoId as string);
    if (alumnoSueltoId) whereClause.alumnoSueltoId = parseInt(alumnoSueltoId as string);
    if (conceptoId) whereClause.conceptoId = parseInt(conceptoId as string);
    if (periodo) whereClause.periodoPago = periodo as string;
    if (fueraDeTermino) whereClause.fueraDeTermino = fueraDeTermino === 'true';
    if (esClaseSuelta) whereClause.esClaseSuelta = esClaseSuelta === 'true';

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
          concepto: true
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
      const { monto, periodoPago, tipoPago, alumnoId, alumnoSueltoId, conceptoId, fueraDeTermino, esClaseSuelta } = req.body;
      console.log('Recibido en API:', req.body);
      
      const reciboData: any = {
        monto: parseFloat(monto),
        periodoPago,
        tipoPago,
        fueraDeTermino: Boolean(fueraDeTermino),
        esClaseSuelta: Boolean(esClaseSuelta),
        concepto: { connect: { id: parseInt(conceptoId) } }
      };

      if (esClaseSuelta) {
        reciboData.alumnoSuelto = { connect: { id: parseInt(alumnoSueltoId) } };
      } else {
        reciboData.alumno = { connect: { id: parseInt(alumnoId) } };
      }

      const recibo = await prisma.recibo.create({
        data: reciboData,
        include: { 
          alumno: true, 
          alumnoSuelto: {
            include: {
              alumnoRegular: true
            }
          }, 
          concepto: true 
        }
      });

      // Si el alumno suelto está asociado a un alumno regular, devolvemos la información del alumno regulars
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
      await prisma.recibo.delete({
        where: { id: reciboId }
      });
      res.status(200).json({ message: 'Recibo eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar recibo:', error);
      res.status(500).json({ error: 'Error al eliminar recibo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}