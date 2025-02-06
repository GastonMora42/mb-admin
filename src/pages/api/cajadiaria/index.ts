//src/api/cajadiaria/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getArgentinaDateTime, getArgentinaDayRange } from '@/utils/dateUtils';

// Tipos para la respuesta de la API
interface ApiResponse {
  recibos: ReciboWithRelations[];
  totalMonto: number;
  totalPorTipoPago: Record<string, number>;
}

interface ApiError {
  error: string;
}

// Tipos para Prisma
type ReciboWithRelations = Prisma.ReciboGetPayload<{
  include: {
    alumno: true;
    concepto: true;
  };
}>;

interface DateRange {
  gte: Date;
  lte: Date;
}

interface WhereClauseType {
  fecha?: DateRange;
  numeroRecibo?: number;
  alumnoId?: number;
  conceptoId?: number;
  periodoPago?: string;
  fueraDeTermino?: boolean;
  tipoPago?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const {
      fechaInicio,
      fechaFin,
      numeroRecibo,
      alumnoId,
      conceptoId,
      periodoPago,
      fueraDeTermino,
      tipoPago
    } = req.query;

    const whereClause: WhereClauseType = {};

    if (fechaInicio && fechaFin) {
      const startDate = getArgentinaDateTime(String(fechaInicio));
      const endDate = getArgentinaDateTime(String(fechaFin));
      endDate.setHours(23, 59, 59, 999);
    
      whereClause.fecha = {
        gte: startDate,
        lte: endDate
      };
    } else {
      const { start, end } = getArgentinaDayRange();
      whereClause.fecha = {
        gte: start,
        lte: end
      };
    }
    
    if (numeroRecibo) {
      whereClause.numeroRecibo = parseInt(String(numeroRecibo), 10);
    }
    if (alumnoId) {
      whereClause.alumnoId = parseInt(String(alumnoId), 10);
    }
    if (conceptoId) {
      whereClause.conceptoId = parseInt(String(conceptoId), 10);
    }
    if (periodoPago) {
      whereClause.periodoPago = String(periodoPago);
    }
    if (fueraDeTermino) {
      whereClause.fueraDeTermino = fueraDeTermino === 'true';
    }
    if (tipoPago) {
      whereClause.tipoPago = String(tipoPago);
    }

    const recibos = await prisma.recibo.findMany({
      where: whereClause as Prisma.ReciboWhereInput,
      include: {
        alumno: true,
        concepto: true,
      },
      orderBy: {
        fecha: 'desc'
      } as Prisma.ReciboOrderByWithRelationInput,
    });
    
    const { start, end } = getArgentinaDayRange();
    
    console.log('Recibos encontrados:', recibos.length);
    if (recibos.length > 0) {
      console.log('Primera fecha:', recibos[0].fecha);
      console.log('Última fecha:', recibos[recibos.length - 1].fecha);
    }

    console.log('Rango de fechas para búsqueda:');
    console.log('Start:', start.toISOString());
    console.log('End:', end.toISOString());
    
    const totalMonto = recibos.reduce((sum, recibo) => sum + recibo.monto, 0);

    const totalPorTipoPago = recibos.reduce<Record<string, number>>((acc, recibo) => {
      const tipo = recibo.tipoPago || 'sin_tipo';
      acc[tipo] = (acc[tipo] || 0) + recibo.monto;
      return acc;
    }, {});

    res.status(200).json({
      recibos,
      totalMonto,
      totalPorTipoPago
    });
  } catch (error) {
    console.error('Error al obtener recibos:', error);
    res.status(500).json({ error: 'Error al obtener recibos' });
  }
}