// pages/api/deudas/generateMonthly.ts
import { Handler } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler: Handler = async (event) => {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtener todos los alumnos activos con sus estilos activos
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
      const mes = (fechaActual.getMonth() + 1).toString();
      const anio = fechaActual.getFullYear();

      const deudasACrear = [];

      // 2. Para cada alumno, generar deudas por cada estilo activo
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

      // 3. Crear todas las deudas nuevas
      if (deudasACrear.length > 0) {
        await tx.deuda.createMany({
          data: deudasACrear
        });
      }

      return deudasACrear.length;
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Se generaron ${resultado} nuevas deudas`
        })
      };
    } catch (error) {
      console.error('Error al generar deudas mensuales:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error al generar deudas mensuales'
        })
      };
    } finally {
      await prisma.$disconnect();
    }
  };