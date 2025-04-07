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
      // Obtener alumnos activos con estilos activos
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
              modalidad: true // Incluir modalidad para saber si es REGULAR o SUELTA
            }
          }
        }
      });

      const fechaActual = new Date();
      // Usar el mes actual (1-12 formato string)
      const mesActual = fechaActual.getMonth(); // 0-11
      const mes = (mesActual + 1).toString(); // Convertir a 1-12 formato string
      const anio = fechaActual.getFullYear();
      const deudasACrear = [];

      // Para propósitos de logging/debugging
      console.log(`Generando deudas para: Mes ${mes}, Año ${anio}`);
      console.log(`Alumnos activos encontrados: ${alumnosActivos.length}`);

      for (const alumno of alumnosActivos) {
        console.log(`Procesando alumno: ${alumno.nombre} ${alumno.apellido}, ID: ${alumno.id}`);
        
        for (const alumnoEstilo of alumno.alumnoEstilos) {
          console.log(`Procesando estilo ${alumnoEstilo.estiloId} para alumno ${alumno.id}`);
          
          // Verificar si ya existe una deuda para este mes/año/estilo
          const deudaExistente = await tx.deuda.findFirst({
            where: {
              alumnoId: alumno.id,
              estiloId: alumnoEstilo.estiloId,
              mes,
              anio
            }
          });

          if (deudaExistente) {
            console.log(`Ya existe deuda para alumno ${alumno.id}, estilo ${alumnoEstilo.estiloId}, periodo ${mes}/${anio}`);
            continue;
          }

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

          // Determinar el monto según la modalidad (REGULAR o SUELTA)
          const esRegular = alumnoEstilo.modalidad.tipo === TipoModalidad.REGULAR;
          let montoCuota;
          
          if (esRegular && concepto.montoRegular) {
            montoCuota = concepto.montoRegular;
          } else if (!esRegular && concepto.montoSuelto) {
            montoCuota = concepto.montoSuelto;
          } else {
            // Fallback al importe del estilo o al monto genérico
            montoCuota = alumnoEstilo.estilo.importe || concepto.monto || 0;
          }

          if (montoCuota <= 0) {
            console.log(`Monto inválido (${montoCuota}) para estilo ${alumnoEstilo.estiloId}`);
            continue;
          }

          console.log(`Creando deuda: Alumno ${alumno.id}, Estilo ${alumnoEstilo.estiloId}, Monto ${montoCuota}`);

          deudasACrear.push({
            alumnoId: alumno.id,
            estiloId: alumnoEstilo.estiloId,
            conceptoId: concepto.id,
            monto: montoCuota,
            mes,
            anio,
            tipoDeuda: alumnoEstilo.modalidad.tipo,
            fechaVencimiento: new Date(anio, mesActual, 10), // Vencimiento el día 10 del mes actual
            pagada: false
          });
        }
      }
      
      console.log(`Intentando crear ${deudasACrear.length} deudas`);
      
      if (deudasACrear.length > 0) {
        // Crear las deudas una por una si createMany falla
        try {
          await tx.deuda.createMany({
            data: deudasACrear
          });
        } catch (error) {
          console.log("Error en createMany, intentando crear deudas individualmente:", error);
          
          // Intentar crear deudas una por una para manejar errores individuales
          let deudasCreadas = 0;
          for (const deuda of deudasACrear) {
            try {
              await tx.deuda.create({
                data: deuda
              });
              deudasCreadas++;
            } catch (error) {
              console.error(`Error creando deuda para alumno ${deuda.alumnoId}, estilo ${deuda.estiloId}:`, error);
            }
          }
          console.log(`Se crearon ${deudasCreadas} deudas individualmente`);
          return deudasCreadas;
        }
      }

      return deudasACrear.length;
    });

    return res.status(200).json({
      success: true,
      message: `Se generaron ${resultado} nuevas deudas`,
      debug: {
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        cantidadDeudas: resultado
      }
    });

  } catch (error) {
    console.error('Error al generar deudas mensuales:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al generar deudas mensuales',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}