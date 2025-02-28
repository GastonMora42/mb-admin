// pages/api/cron/generate-monthly-debts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar que sea una solicitud autorizada
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const alumnosActivos = await tx.alumno.findMany({
        where: {
          activo: true,
          alumnoEstilos: {
            some: {
              activo: true
            }
          }
        },
        include: {
          alumnoEstilos: {
            where: {
              activo: true
            },
            include: {
              estilo: true
            }
          }
        }
      });

      

      const fechaActual = new Date();
      const mes = (fechaActual.getMonth() + 2).toString();  // Mes siguiente (por ejemplo, octubre → 11, noviembre)
      const anio = fechaActual.getFullYear();
      const deudasACrear = [];

      for (const alumno of alumnosActivos) {
        for (const alumnoEstilo of alumno.alumnoEstilos) {
          const deudaExistente = await tx.deuda.findFirst({
            where: {
              alumnoId: alumno.id,
              estiloId: alumnoEstilo.estiloId,
              mes,
              anio
            }
          });

          if (!deudaExistente) {
            deudasACrear.push({
              alumnoId: alumno.id,
              estiloId: alumnoEstilo.estiloId,
              monto: alumnoEstilo.estilo.importe || 0,
              montoOriginal: alumnoEstilo.estilo.importe || 0,
              mes,
              anio,
              fechaVencimiento: new Date(anio, fechaActual.getMonth(), 10),
              pagada: false
            });
          }
        }
      }

      
      
      if (deudasACrear.length > 0) {
        await tx.deuda.createMany({
          data: deudasACrear
        });
      }

      return deudasACrear.length;
    });

    return res.status(200).json({
      success: true,
      message: `Se generaron ${resultado} nuevas deudas`
    });

  } catch (error) {
    console.error('Error al generar deudas mensuales:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al generar deudas mensuales' 
    });
  }
}