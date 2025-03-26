// pages/api/deudas/generateMonthly.ts
import { Handler } from 'aws-lambda';
import { PrismaClient, TipoModalidad, Concepto } from '@prisma/client';

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
              estilo: true,
              modalidad: true // Incluir modalidad
            }
          }
        }
      });

      const fechaActual = new Date();
      const mes = (fechaActual.getMonth() + 1).toString();
      const anio = fechaActual.getFullYear();

      const deudasACrear = [];
      
      // Definir el tipo correcto para el cache
      const conceptosCache: Record<number, Concepto> = {}; 

      // 2. Para cada alumno, generar deudas por cada estilo activo
      for (const alumno of alumnosActivos) {
        for (const alumnoEstilo of alumno.alumnoEstilos) {
          // Verificar si ya existe una deuda para este mes/año/estilo
          const deudaExistente = await tx.deuda.findFirst({
            where: {
              alumnoId: alumno.id,
              estiloId: alumnoEstilo.estiloId,
              mes,
              anio,
              tipoDeuda: alumnoEstilo.modalidad?.tipo || TipoModalidad.REGULAR
            }
          });

          if (!deudaExistente) {
            // Obtener el concepto correspondiente al estilo
            if (!conceptosCache[alumnoEstilo.estiloId]) {
              const concepto = await tx.concepto.findFirst({
                where: {
                  estiloId: alumnoEstilo.estiloId,
                  esInscripcion: false
                }
              });
              
              if (concepto) {
                conceptosCache[alumnoEstilo.estiloId] = concepto;
              } else {
                console.warn(`No se encontró concepto para el estilo ID ${alumnoEstilo.estiloId}`);
                continue; // Saltar este estilo si no hay concepto
              }
            }
            
            const concepto = conceptosCache[alumnoEstilo.estiloId];
            const modalidadTipo = alumnoEstilo.modalidad?.tipo || TipoModalidad.REGULAR;
            
// Determinar el monto según la modalidad y asegurar que nunca sea null
const monto = modalidadTipo === TipoModalidad.REGULAR 
  ? (concepto.montoRegular ?? 0) // Usar 0 como valor predeterminado si es null 
  : (concepto.montoSuelto ?? 0); // Usar 0 como valor predeterminado si es null

deudasACrear.push({
  alumnoId: alumno.id,
  estiloId: alumnoEstilo.estiloId,
  conceptoId: concepto.id,
  monto: monto, // Este valor ya nunca será null
  mes,
  anio,
  tipoDeuda: modalidadTipo,
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
        error: 'Error al generar deudas mensuales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    };
  } finally {
    await prisma.$disconnect();
  }
};