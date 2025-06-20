// pages/api/liquidaciones/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { Prisma, TipoModalidad } from '@prisma/client'

interface LiquidacionResponse {
  regularCount: number;
  sueltasCount: number;
  clasesCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: any[];
  periodo: string;
  configuracion: {
    tipoRegular: 'PORCENTAJE' | 'MONTO_FIJO';
    tipoSueltas: 'PORCENTAJE' | 'MONTO_FIJO';
    valorRegular: number;
    valorSueltas: number;
  };
}

interface ConfiguracionLiquidacion {
  tipoRegular: 'PORCENTAJE' | 'MONTO_FIJO';
  tipoSueltas: 'PORCENTAJE' | 'MONTO_FIJO';
  porcentajeRegular: number;
  porcentajeSueltas: number;
  montoFijoRegular: number;
  montoFijoSueltas: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const profesores = await prisma.profesor.findMany({
        orderBy: {
          apellido: 'asc'
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          porcentajePorDefecto: true,
          porcentajeClasesSueltasPorDefecto: true,
          montoFijoRegular: true,
          montoFijoSueltas: true,
          tipoLiquidacionRegular: true,
          tipoLiquidacionSueltas: true,
          estilos: true
        }
      });
      
      return res.status(200).json(profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return res.status(500).json({ error: 'Error al obtener profesores' });
    }
  }

  if (req.method === 'POST') {
    const { periodo, profesorId, configuracion } = req.body;

    try {
      if (!periodo || !profesorId) {
        return res.status(400).json({ error: 'El período y profesor son requeridos' });
      }

      const [year, month] = periodo.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

      // Obtener información del profesor
      const profesor = await prisma.profesor.findUnique({
        where: { id: Number(profesorId) },
        include: {
          estilos: true
        }
      });

      if (!profesor) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // QUERY CORREGIDO - Sin usar la relación modalidad
      const where = {
        AND: [
          { 
            fechaEfecto: {
              gte: startDate,
              lte: endDate
            }
          },
          { anulado: false },
          {
            OR: [
              // Recibos regulares por los estilos del profesor
              {
                concepto: {
                  estilo: {
                    profesorId: Number(profesorId)
                  }
                }
              },
              // Clases sueltas donde el profesor dio la clase
              {
                AND: [
                  { esClaseSuelta: true },
                  {
                    clase: {
                      profesorId: Number(profesorId)
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      // Obtener recibos
      const recibos = await prisma.recibo.findMany({
        where,
        include: {
          alumno: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          alumnoSuelto: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          concepto: {
            include: {
              estilo: true
            }
          },
          clase: {
            include: {
              profesor: true,
              estilo: true
              // REMOVIDO: modalidad: true - ya que no existe la relación
            }
          }
        },
        orderBy: [
          { fechaEfecto: 'asc' }
        ]
      });

      console.log(`Recibos encontrados: ${recibos.length}`);
      
      // QUERY CORREGIDO PARA CLASES - Obtener modalidades por separado si es necesario
      const clasesDelMes = await prisma.clase.findMany({
        where: {
          profesorId: Number(profesorId),
          fecha: {
            gte: startDate,
            lte: endDate
          }
          // REMOVIDO: modalidad filter - haremos el filtro después
        },
        include: {
          asistencias: {
            where: {
              asistio: true
            }
          },
          alumnosSueltos: true
        }
      });

      // Si necesitas filtrar por modalidad, hazlo por separado
      let modalidadesSueltas: any[] = [];
      if (clasesDelMes.length > 0) {
        const modalidadIds = clasesDelMes
          .map(clase => clase.modalidadId)
          .filter(id => id !== null);
        
        if (modalidadIds.length > 0) {
          modalidadesSueltas = await prisma.modalidadClase.findMany({
            where: {
              id: { in: modalidadIds },
              tipo: TipoModalidad.SUELTA
            }
          });
        }
      }

      const modalidadesSueltasIds = new Set(modalidadesSueltas.map(m => m.id));
      
      // Filtrar clases sueltas basado en modalidades obtenidas
      const clasesSueltasDelMes = clasesDelMes.filter(clase => 
        clase.modalidadId && modalidadesSueltasIds.has(clase.modalidadId)
      );
      
      // Separar recibos regulares y sueltos
      const regularRecibos = recibos.filter(recibo => {
        return !recibo.esClaseSuelta;
      });

      const sueltasRecibos = recibos.filter(recibo => {
        return recibo.esClaseSuelta === true;
      });

      console.log(`Recibos clasificados: ${regularRecibos.length} regulares y ${sueltasRecibos.length} sueltas`);
      
      // Contar clases sueltas y alumnos únicos
      const totalClasesSueltasPorRecibos = sueltasRecibos.length;
      const totalAsistenciasClasesSueltas = clasesSueltasDelMes.reduce(
        (total, clase) => total + clase.asistencias.length + clase.alumnosSueltos.length, 
        0
      );

      // Contar alumnos únicos que tomaron clases sueltas
      const alumnosSueltoIds = new Set();
      sueltasRecibos.forEach(recibo => {
        if (recibo.alumnoId) alumnosSueltoIds.add(recibo.alumnoId);
        if (recibo.alumnoSueltoId) alumnosSueltoIds.add(recibo.alumnoSueltoId);
      });
      
      clasesSueltasDelMes.forEach(clase => {
        clase.asistencias.forEach(asistencia => {
          if (asistencia.alumnoId) {
            alumnosSueltoIds.add(asistencia.alumnoId);
          }
        });
        clase.alumnosSueltos.forEach(alumnoSuelto => {
          alumnosSueltoIds.add(`suelto_${alumnoSuelto.id}`);
        });
      });

      // Calcular totales
      const totalRegular = regularRecibos.reduce((sum, r) => sum + r.monto, 0);
      const totalSueltas = sueltasRecibos.reduce((sum, r) => sum + r.monto, 0);

      // Determinar configuración a usar
      const configFinal: ConfiguracionLiquidacion = configuracion || {
        tipoRegular: profesor.tipoLiquidacionRegular || 'PORCENTAJE',
        tipoSueltas: profesor.tipoLiquidacionSueltas || 'PORCENTAJE',
        porcentajeRegular: (profesor.porcentajePorDefecto || 0.6) * 100,
        porcentajeSueltas: (profesor.porcentajeClasesSueltasPorDefecto || 0.8) * 100,
        montoFijoRegular: profesor.montoFijoRegular || 0,
        montoFijoSueltas: profesor.montoFijoSueltas || 0
      };

      // Calcular montos de liquidación según el tipo configurado
      const montoLiquidacionRegular = configFinal.tipoRegular === 'MONTO_FIJO'
        ? configFinal.montoFijoRegular
        : totalRegular * (configFinal.porcentajeRegular / 100);

      const montoLiquidacionSueltas = configFinal.tipoSueltas === 'MONTO_FIJO'
        ? configFinal.montoFijoSueltas
        : totalSueltas * (configFinal.porcentajeSueltas / 100);

      // Preparar recibos con información de liquidación
      const recibosConLiquidacion = [
        ...regularRecibos.map(recibo => {
          const montoIndividual = configFinal.tipoRegular === 'MONTO_FIJO'
            ? regularRecibos.length > 0 ? montoLiquidacionRegular / regularRecibos.length : 0
            : recibo.monto * (configFinal.porcentajeRegular / 100);
          
          return {
            ...recibo,
            tipoLiquidacion: 'Regular',
            porcentajeAplicado: configFinal.tipoRegular === 'MONTO_FIJO' 
              ? null 
              : configFinal.porcentajeRegular / 100,
            montoLiquidacion: montoIndividual
          };
        }),
        ...sueltasRecibos.map(recibo => {
          const montoIndividual = configFinal.tipoSueltas === 'MONTO_FIJO'
            ? sueltasRecibos.length > 0 ? montoLiquidacionSueltas / sueltasRecibos.length : 0
            : recibo.monto * (configFinal.porcentajeSueltas / 100);
          
          return {
            ...recibo,
            tipoLiquidacion: 'Clase Suelta',
            porcentajeAplicado: configFinal.tipoSueltas === 'MONTO_FIJO' 
              ? null 
              : configFinal.porcentajeSueltas / 100,
            montoLiquidacion: montoIndividual
          };
        })
      ];

      // Crear liquidación en la base de datos
      if (recibosConLiquidacion.length > 0) {
        try {
          const liquidacion = await prisma.liquidacion.create({
            data: {
              fecha: new Date(),
              mes: Number(month),
              anio: Number(year),
              profesor: {
                connect: { id: Number(profesorId) }
              },
              montoTotalRegular: totalRegular,
              montoTotalSueltas: totalSueltas,
              porcentajeRegular: configFinal.porcentajeRegular / 100,
              porcentajeSueltas: configFinal.porcentajeSueltas / 100,
              totalLiquidar: montoLiquidacionRegular + montoLiquidacionSueltas,
              estado: 'PENDIENTE',
              tipoLiquidacionRegular: configFinal.tipoRegular,
              tipoLiquidacionSueltas: configFinal.tipoSueltas,
              montoFijoRegular: configFinal.tipoRegular === 'MONTO_FIJO' ? configFinal.montoFijoRegular : null,
              montoFijoSueltas: configFinal.tipoSueltas === 'MONTO_FIJO' ? configFinal.montoFijoSueltas : null,
              detalles: {
                create: recibosConLiquidacion.map(recibo => ({
                  montoOriginal: recibo.monto,
                  porcentaje: recibo.porcentajeAplicado || 0,
                  montoLiquidado: recibo.montoLiquidacion,
                  recibo: {
                    connect: { id: recibo.id }
                  }
                }))
              }
            } as any
          });

          console.log('Liquidación creada:', liquidacion.id);
        } catch (error) {
          console.error('Error al crear liquidación en DB:', error);
        }
      }

      // Preparar respuesta
      const liquidacionData: LiquidacionResponse = {
        regularCount: regularRecibos.length,
        sueltasCount: alumnosSueltoIds.size,
        clasesCount: totalAsistenciasClasesSueltas,
        totalRegular,
        totalSueltas,
        montoLiquidacionRegular,
        montoLiquidacionSueltas,
        recibos: recibosConLiquidacion.map(recibo => ({
          id: recibo.id,
          numeroRecibo: recibo.numeroRecibo,
          fecha: recibo.fecha,
          fechaEfecto: recibo.fechaEfecto,
          monto: recibo.monto,
          montoLiquidacion: recibo.montoLiquidacion,
          porcentajeAplicado: recibo.porcentajeAplicado,
          tipoLiquidacion: recibo.tipoLiquidacion,
          alumno: recibo.alumno || recibo.alumnoSuelto,
          concepto: {
            nombre: recibo.concepto.nombre,
            estilo: recibo.concepto.estilo?.nombre
          },
          clase: recibo.clase ? {
            fecha: recibo.clase.fecha,
            estilo: recibo.clase.estilo.nombre,
            modalidadId: recibo.clase.modalidadId // Cambiado: en lugar de modalidad.tipo
          } : null
        })),
        periodo,
        configuracion: {
          tipoRegular: configFinal.tipoRegular,
          tipoSueltas: configFinal.tipoSueltas,
          valorRegular: configFinal.tipoRegular === 'MONTO_FIJO' 
            ? configFinal.montoFijoRegular 
            : configFinal.porcentajeRegular,
          valorSueltas: configFinal.tipoSueltas === 'MONTO_FIJO' 
            ? configFinal.montoFijoSueltas 
            : configFinal.porcentajeSueltas
        }
      };

      return res.status(200).json(liquidacionData);

    } catch (error) {
      console.error('Error al generar liquidación:', error);
      return res.status(500).json({ 
        error: 'Error al generar liquidación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}