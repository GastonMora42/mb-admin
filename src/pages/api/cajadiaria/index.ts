//src/api/cajadiaria/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

// Función auxiliar para obtener fecha en Argentina
const getArgentinaDate = (date?: Date) => {
  const d = date || new Date();
  return new Date(d.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
};

// En el handler, modificar el manejo de fechas
if (fechaInicio && fechaFin) {
  whereClause.fecha = {
    gte: getArgentinaDate(new Date(String(fechaInicio))),
    lte: new Date(new Date(String(fechaFin) + 'T23:59:59.999-03:00')),
  };
} else {
  const hoyArgentina = getArgentinaDate();
  hoyArgentina.setHours(0, 0, 0, 0);
  const mañanaArgentina = new Date(hoyArgentina);
  mañanaArgentina.setDate(mañanaArgentina.getDate() + 1);
  
  whereClause.fecha = {
    gte: hoyArgentina,
    lte: mañanaArgentina,
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