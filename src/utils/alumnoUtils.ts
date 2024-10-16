// utils/alumnoUtils.ts

import { PrismaClient, Alumno, Estilo, Deuda, Recibo } from '@prisma/client';

const prisma = new PrismaClient();

export async function generarDeudaMensual(alumnoId: number) {
  const alumno = await prisma.alumno.findUnique({
    where: { id: alumnoId },
    include: { 
      estilos: {
        include: {
          conceptos: true
        }
      }
    }
  });

  if (!alumno || !alumno.activo) return;

  const fechaActual = new Date();
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();

  for (const estilo of alumno.estilos) {
    const deudaExistente = await prisma.deuda.findFirst({
      where: {
        alumnoId,
        estiloId: estilo.id,
        mes: mes.toString(),
        anio,
        pagada: false
      }
    });

    if (!deudaExistente) {
      const conceptoMensual = estilo.conceptos.find(c => c.nombre.toLowerCase().includes('mensual'));
      const monto = conceptoMensual?.monto || 0;

      await prisma.deuda.create({
        data: {
          alumnoId,
          estiloId: estilo.id,
          monto,
          mes: mes.toString(),
          anio,
        }
      });
    }
  }
}

export async function generarRecibo(alumnoId: number, estiloId: number, monto: number) {
  const recibo = await prisma.recibo.create({
    data: {
      alumnoId,
      conceptoId: estiloId, // Asumimos que el conceptoId es el mismo que el estiloId
      monto,
      periodoPago: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      tipoPago: 'EFECTIVO', // Por defecto, puedes cambiarlo según necesites
    }
  });

  // Marcar la deuda como pagada
  await prisma.deuda.updateMany({
    where: {
      alumnoId,
      estiloId,
      mes: recibo.periodoPago.split('/')[0],
      anio: parseInt(recibo.periodoPago.split('/')[1]),
      pagada: false
    },
    data: { pagada: true }
  });

  return recibo;
}

export async function darDeBajaAlumno(alumnoId: number) {
  await prisma.alumno.update({
    where: { id: alumnoId },
    data: { activo: false }
  });
}

export async function reactivarAlumno(alumnoId: number) {
  await prisma.alumno.update({
    where: { id: alumnoId },
    data: { activo: true }
  });
}