// pages/api/dashboard.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [
        totalAlumnos,
        alumnosActivos,
        nuevoAlumnos,
        totalClases,
        totalAsistencias,
        ingresosMes,
        estilosPopulares,
        deudaTotal
      ] = await Promise.all([
        prisma.alumno.count(),
        prisma.alumno.count({ where: { activo: true } }),
        prisma.alumno.count({ where: { fechaIngreso: { gte: firstDayOfMonth, lte: lastDayOfMonth } } }),
        prisma.clase.count({ where: { fecha: { gte: firstDayOfMonth, lte: lastDayOfMonth } } }),
        prisma.asistencia.count({ where: { asistio: true, clase: { fecha: { gte: firstDayOfMonth, lte: lastDayOfMonth } } } }),
        prisma.recibo.aggregate({ _sum: { monto: true }, where: { fecha: { gte: firstDayOfMonth, lte: lastDayOfMonth } } }),
        prisma.estilo.findMany({
          select: { id: true, nombre: true, _count: { select: { alumnos: true } } },
          orderBy: { alumnos: { _count: 'desc' } },
          take: 5
        }),
        prisma.deuda.aggregate({ _sum: { monto: true }, where: { pagada: false } })
      ]);

      res.status(200).json({
        totalAlumnos,
        alumnosActivos,
        nuevoAlumnos,
        totalClases,
        totalAsistencias,
        ingresosMes: ingresosMes._sum.monto || 0,
        estilosPopulares,
        deudaTotal: deudaTotal._sum.monto || 0,
        mesActual: `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`
      });
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      res.status(500).json({ error: 'Error al obtener datos del dashboard' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}