// pages/api/cron/generate-monthly-debts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { TipoModalidad } from '@prisma/client';

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
          // Verificar si ya existe una deuda para este mes/año/estilo
          const deudaExistente = await tx.deuda.findFirst({
            where: {
              alumnoId: alumno.id,
              estiloId: alumnoEstilo.estiloId,
              mes,
              anio
            }
          });

          if (!deudaExistente) {
            // Obtener el concepto correspondiente al estilo
            const concepto = await tx.concepto.findFirst({
              where: {
                estiloId: alumnoEstilo.estiloId,
                esInscripcion: false
              }
            });

            if (!concepto) {
              console.log(`No se encontró concepto para el estilo ${alumnoEstilo.estiloId}`);
              continue;
            }

            // Usar el precio del concepto (montoRegular) o el importe del estilo como respaldo
            const montoCuota = concepto.montoRegular || alumnoEstilo.estilo.importe || 0;

            deudasACrear.push({
              alumnoId: alumno.id,
              estiloId: alumnoEstilo.estiloId,
              conceptoId: concepto.id,
              monto: montoCuota,
              mes,
              anio,
              tipoDeuda: TipoModalidad.REGULAR,
              fechaVencimiento: new Date(anio, fechaActual.getMonth(), 10),
              pagada: false
            });
          }
        }
      }
      
      if (deudasACrear.length > 0) {
        // Crear las deudas una por una si createMany falla
        try {
          await tx.deuda.createMany({
            data: deudasACrear
          });
        } catch (error) {
          console.log("Error en createMany, intentando crear deudas individualmente:", error);
          for (const deuda of deudasACrear) {
            await tx.deuda.create({
              data: deuda
            });
          }
        }
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