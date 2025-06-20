//src/pages/api/recibos/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { PrinterService } from '@/lib/printer/printer.service'
import { getArgentinaDateTime, getArgentinaDayRange } from '@/utils/dateUtils';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumentar límite de tamaño
    },
    responseLimit: '10mb', // Aumentar límite de respuesta
    externalResolver: true, // Permitir resolución externa
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setTimeout(30000); // 30 segundos
  if (req.method === 'GET') {
    const { 
      numero, 
      alumnoId, 
      alumnoSueltoId, 
      conceptoId, 
      periodo, 
      fueraDeTermino, 
      esClaseSuelta,
      esMesCompleto,
      fechaDesde,
      fechaHasta,
      anulado,
      // Nuevos parámetros de paginación
      page = '1',
      limit = '15'
    } = req.query;
    
    interface DateRange {
      gte?: Date;
      lte?: Date;
    }
    
    interface WhereClause {
      numeroRecibo?: number;
      alumnoId?: number;
      alumnoSueltoId?: number;
      conceptoId?: number;
      periodoPago?: string;
      fueraDeTermino?: boolean;
      esClaseSuelta?: boolean;
      esMesCompleto?: boolean;
      anulado?: boolean;
      fecha?: DateRange;
    }
    
    const whereClause: WhereClause = {};
    
    if (numero) {
      whereClause.numeroRecibo = parseInt(numero.toString(), 10);
    }
    
    if (alumnoId) {
      whereClause.alumnoId = parseInt(alumnoId.toString(), 10);
    }
    
    if (alumnoSueltoId) {
      whereClause.alumnoSueltoId = parseInt(alumnoSueltoId.toString(), 10);
    }
    
    if (conceptoId) {
      whereClause.conceptoId = parseInt(conceptoId.toString(), 10);
    }
    
    if (periodo) {
      whereClause.periodoPago = periodo.toString();
    }
    
    if (fueraDeTermino) {
      whereClause.fueraDeTermino = fueraDeTermino === 'true';
    }
    
    if (esClaseSuelta) {
      whereClause.esClaseSuelta = esClaseSuelta === 'true';
    }
    
    if (esMesCompleto) {
      whereClause.esMesCompleto = esMesCompleto === 'true';
    }
    
    if (anulado !== undefined) {
      whereClause.anulado = anulado === 'true';
    }
    
    if (fechaDesde || fechaHasta) {
      whereClause.fecha = {};
      if (fechaDesde) {
        whereClause.fecha.gte = new Date(fechaDesde.toString());
      }
      if (fechaHasta) {
        whereClause.fecha.lte = new Date(fechaHasta.toString());
      }
    }
    
    try {
      // Calcular el skip basado en la página actual
      const currentPage = parseInt(page.toString());
      const itemsPerPage = parseInt(limit.toString());
      const skip = (currentPage - 1) * itemsPerPage;

      // Primero obtener el total de registros
      const total = await prisma.recibo.count({
        where: whereClause
      });

      // Luego obtener los recibos paginados
      const recibos = await prisma.recibo.findMany({
        where: whereClause,
        include: { 
          alumno: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              email: true,
              telefono: true,
              activo: true
            }
          },
          alumnoSuelto: {
            include: {
              alumnoRegular: true
            }
          },
          concepto: {
            include: {
              estilo: true
            }
          },
          pagosDeuda: {
            include: {
              deuda: {
                include: {
                  estilo: true,
                  concepto: {
                    select: {
                      id: true,
                      nombre: true,
                      montoRegular: true,
                      montoSuelto: true,
                      esInscripcion: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { fecha: 'desc' },
          { numeroRecibo: 'desc' } // Agregar ordenamiento secundario
        ],
        skip,
        take: itemsPerPage
      });

      // Procesar recibos y agregar propiedades calculadas necesarias para el frontend
      const procesedRecibos = recibos.map(recibo => {
        // Verificar si hay deudas de inscripción pagadas
        const tieneInscripcionPagada = recibo.pagosDeuda.some(
          pago => pago.deuda.concepto?.esInscripcion === true
        );

        const fechaPagoInscripcion = tieneInscripcionPagada 
          ? recibo.pagosDeuda.find(pago => pago.deuda.concepto?.esInscripcion === true)?.fecha 
          : null;

        // Procesar pagos de deuda para manejar estilo null
        const pagosDeudaProcesados = recibo.pagosDeuda.map(pago => {
          if (!pago.deuda.estilo) {
            const nombreEstilo = pago.deuda.concepto?.esInscripcion 
              ? "Inscripción" 
              : pago.deuda.tipoDeuda === "SUELTA" 
                ? "Clase suelta" 
                : "Sin estilo";
                
            return {
              ...pago,
              deuda: {
                ...pago.deuda,
                estiloNombre: nombreEstilo,
                estilo: {
                  nombre: nombreEstilo,
                  id: null
                }
              }
            };
          }
          return pago;
        });

        // Si el alumno suelto tiene un alumno regular asociado, usar ese alumno
        if (recibo.alumnoSueltoId && recibo.alumnoSuelto?.alumnoRegular) {
          return {
            ...recibo,
            alumno: {
              ...recibo.alumnoSuelto.alumnoRegular,
              // Agregar propiedades calculadas
              inscripcionPagada: tieneInscripcionPagada,
              fechaPagoInscripcion: fechaPagoInscripcion
            },
            alumnoSuelto: null,
            pagosDeuda: pagosDeudaProcesados
          };
        }

        // Para alumnos regulares, agregar propiedades calculadas
        if (recibo.alumnoId && recibo.alumno) {
          return {
            ...recibo,
            alumno: {
              ...recibo.alumno,
              inscripcionPagada: tieneInscripcionPagada,
              fechaPagoInscripcion: fechaPagoInscripcion
            },
            pagosDeuda: pagosDeudaProcesados
          };
        }

        return {
          ...recibo,
          pagosDeuda: pagosDeudaProcesados
        };
      });

      // Devolver los datos paginados
      res.status(200).json({
        recibos: procesedRecibos,
        pagination: {
          total,
          pages: Math.ceil(total / itemsPerPage),
          currentPage,
          itemsPerPage
        }
      });
    } catch (error) {
      console.error('Error al obtener recibos:', error);
      res.status(500).json({ error: 'Error al obtener recibos' });
    }
  }
  
else if (req.method === 'POST') {
  try {
    const { 
      monto,
      montoOriginal,
      descuento,
      periodoPago, 
      tipoPago, 
      alumnoId, 
      alumnoSueltoId, 
      conceptoId, 
      esClaseSuelta,
      claseId,
      esMesCompleto,
      deudasAPagar,
      fecha,
    } = req.body;
 
    const fechaArgentina = getArgentinaDateTime();
    const printerService = new PrinterService();

    const { start } = fecha ? 
      getArgentinaDayRange(fecha) : 
      getArgentinaDayRange();

    // ⚠️ Movemos la lógica de detección fuera de la transacción
    // para reducir el tiempo de transacción
    
    // Obtener información del concepto para validar si es clase suelta
    const concepto = await prisma.concepto.findUnique({
      where: { id: parseInt(conceptoId) },
      include: { estilo: true }
    });

    // Determinar si es clase suelta basado en múltiples criterios
    let esClaseSueltaFinal = esClaseSuelta || false;
    
    // Si no viene marcado explícitamente, hacemos detección adicional
    if (!esClaseSueltaFinal) {
      // 1. Si el concepto incluye "suelta" en el nombre
      const esClaseSueltaPorConcepto = concepto?.nombre.toLowerCase().includes('suelta') || false;
      
      // 2. Si coincide con el monto de clase suelta del concepto
      const montoSuelto = concepto?.montoSuelto || 0;
      const montoFloat = parseFloat(monto);
      const esClaseSueltaPorMonto = Math.abs(montoFloat - montoSuelto) < 0.01;
      
      // 3. Si es un alumno suelto
      const esClaseSueltaPorAlumno = !!alumnoSueltoId;
      
      
      // 4. Si tiene clase con modalidad SUELTA
      const esClaseSueltaPorModalidad = false;
      if (claseId) {
        const clase = await prisma.clase.findUnique({
          where: { id: parseInt(claseId) },
        });
      }
      esClaseSueltaFinal = esClaseSueltaPorConcepto || esClaseSueltaPorMonto || 
                          esClaseSueltaPorAlumno || esClaseSueltaPorModalidad;
      console.log('Detección de clase suelta:', {
        porConcepto: esClaseSueltaPorConcepto,
        porMonto: esClaseSueltaPorMonto,
        porAlumno: esClaseSueltaPorAlumno,
        porModalidad: esClaseSueltaPorModalidad,
        resultado: esClaseSueltaFinal
      });
    }

    // Ahora realizamos la transacción de forma más eficiente
    const recibo = await prisma.$transaction(async (tx) => {
      // Crear el recibo primero
      const nuevoRecibo = await tx.recibo.create({
        data: {
          monto: parseFloat(monto),
          montoOriginal: parseFloat(montoOriginal || monto),
          descuento: descuento ? parseFloat(descuento) : null,
          fecha: start,
          fechaEfecto: start,
          periodoPago,
          tipoPago,
          esClaseSuelta: esClaseSueltaFinal,
          esMesCompleto,
          concepto: { connect: { id: parseInt(conceptoId) } },
          ...(claseId && {
            clase: { connect: { id: parseInt(claseId) } }
          }),
          ...(alumnoId ? {
            alumno: { connect: { id: parseInt(alumnoId) } }
          } : {
            alumnoSuelto: { connect: { id: parseInt(alumnoSueltoId) } }
          })
        },
        include: {
          alumno: true,
          alumnoSuelto: true,
          concepto: {
            include: {
              estilo: {
                include: { profesor: true }
              }
            }
          },
          clase: {
            include: {
              profesor: true,
              estilo: true,            }
          }
        }
      });
 
      // Procesar pagos de deuda solo si hay alumnoId y deudasAPagar
      if (alumnoId && deudasAPagar?.length > 0) {
        for (const deuda of deudasAPagar) {
          const deudaOriginal = await tx.deuda.findUnique({
            where: { id: deuda.deudaId },
            include: { 
              concepto: true,
              estilo: true
            }
          });

          if (!deudaOriginal) {
            console.error(`Deuda ${deuda.deudaId} no encontrada`);
            continue;
          }

          // Crear pago para esta deuda
          await tx.pagoDeuda.create({
            data: {
              deudaId: deuda.deudaId,
              reciboId: nuevoRecibo.id,
              monto: deuda.monto,
              fecha: start
            }
          });
          
          // Actualizar deuda como pagada si corresponde
          const pagosExistentes = await tx.pagoDeuda.findMany({
            where: { deudaId: deuda.deudaId }
          });
          
          const totalPagado = pagosExistentes.reduce((sum, pago) => sum + pago.monto, 0);
          
          if (totalPagado >= deudaOriginal.monto) {
            await tx.deuda.update({
              where: { id: deuda.deudaId },
              data: { pagada: true }
            });
          }

          // Procesamiento condicional para inscripción (simplificado)
          if (deudaOriginal.concepto?.esInscripcion) {
            // Marcar deudas de clase suelta como pagadas
            const deudasClaseSuelta = await tx.deuda.findMany({
              where: {
                alumnoId: parseInt(alumnoId),
                tipoDeuda: 'SUELTA',
                pagada: false
              }
            });
            
            for (const deudaSuelta of deudasClaseSuelta) {
              await tx.deuda.update({
                where: { id: deudaSuelta.id },
                data: { pagada: true }
              });
            }
          }
        }
      }
      
      return nuevoRecibo;
    }, {
      // Opciones de transacción - Aumentamos el timeout
      timeout: 20000 // 20 segundos (ajusta según sea necesario)
    });
 
    // Recuperamos los pagosDeuda fuera de la transacción principal
    const pagosDeuda = await prisma.pagoDeuda.findMany({
      where: { reciboId: recibo.id },
      include: {
        deuda: {
          include: {
            estilo: true,
            concepto: true
          }
        }
      }
    });

    // Construimos el objeto final
    const reciboFinal = {
      ...recibo,
      pagosDeuda
    };
 
    // Intentar imprimir fuera de la transacción
    Promise.race([
      printerService.printReceipt(reciboFinal),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de impresión')), 8000))
    ]).catch(error => {
      console.error('Error en impresión:', error);
    });
 
    return res.status(201).json(reciboFinal);
 
  } catch (error) {
    console.error('Error al crear recibo:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Error al crear recibo',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
  
  else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de recibo no proporcionado o inválido' });
    }

    try {
      const reciboId = parseInt(id);
      
      await prisma.$transaction(async (prisma) => {
        // Obtener pagos de deuda asociados
        const pagosDeuda = await prisma.pagoDeuda.findMany({
          where: { reciboId },
          include: { deuda: true }
        });

        // Revertir los pagos de deuda
        for (const pago of pagosDeuda) {
          // Obtener todos los pagos para esta deuda
          const todosLosPagos = await prisma.pagoDeuda.findMany({
            where: { deudaId: pago.deudaId }
          });
          
          // Calcular total pagado sin este pago
          const otrosPagos = todosLosPagos.filter(p => p.id !== pago.id);
          const montoPagado = otrosPagos.reduce((sum, p) => sum + p.monto, 0);
          
          // Marcar la deuda como no pagada si quedaría con saldo
          const deuda = await prisma.deuda.findUnique({
            where: { id: pago.deudaId },
            select: { monto: true }
          });
          
          if (deuda && montoPagado < deuda.monto) {
            await prisma.deuda.update({
              where: { id: pago.deudaId },
              data: { pagada: false }
            });
          }

          // Eliminar el pago
          await prisma.pagoDeuda.delete({
            where: { id: pago.id }
          });
        }

        // Marcar el recibo como anulado
        await prisma.recibo.update({
          where: { id: reciboId },
          data: { 
            anulado: true,
            motivoAnulacion: 'Recibo anulado por el usuario'
          }
        });
      });
      
      res.status(200).json({ message: 'Recibo anulado exitosamente' });
    } catch (error) {
      console.error('Error al anular recibo:', error);
      res.status(500).json({ error: 'Error al anular recibo' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}