import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

interface ReciboAgrupado {
  id: number;
  numeroRecibo: number;
  fecha: Date;
  monto: number;
  periodoPago: string;
  tipoPago: string;
  alumno: {
    id: number;
    nombre: string;
    apellido: string;
  };
  concepto: {
    id: number;
    nombre: string;
  };
}

interface RecibosAgrupados {
  [key: string]: ReciboAgrupado[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const conceptos = await prisma.concepto.findMany({
        orderBy: { nombre: 'asc' }
      });
      res.status(200).json(conceptos);
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
      res.status(500).json({ error: 'Error al obtener conceptos' });
    }
  } else if (req.method === 'POST') {
    const { año, periodo, conceptosIds } = req.body;

    try {
      const recibos = await prisma.recibo.findMany({
        where: {
          AND: [
            { periodoPago: { startsWith: año } },
            { periodoPago: { endsWith: periodo } },
            { conceptoId: { in: conceptosIds } }
          ]
        },
        include: {
          alumno: true,
          concepto: true
        },
        orderBy: [
          { alumno: { apellido: 'asc' } },
          { alumno: { nombre: 'asc' } },
          { fecha: 'asc' }
        ]
      });

      // Agrupar recibos por alumnos
      const recibosAgrupados = recibos.reduce<RecibosAgrupados>((acc, recibo) => {
        const key = `${recibo.alumno.id}-${recibo.alumno.apellido}-${recibo.alumno.nombre}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(recibo);
        return acc;
      }, {});

      // Ordenar y aplanar los recibos agrupados
      const recibosOrdenados = Object.values(recibosAgrupados).flat();

      res.status(200).json(recibosOrdenados);
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      res.status(500).json({ error: 'Error al obtener recibos' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

