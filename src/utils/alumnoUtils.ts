// utils/alumnoUtils.ts

import { PrismaClient, Alumno, Estilo, Deuda, Recibo, TipoPago } from '@prisma/client';

const prisma = new PrismaClient();

export async function generarDeudaMensual(alumnoId: number) {
  const alumno = await prisma.alumno.findUnique({
    where: { id: alumnoId },
    include: { 
      alumnoEstilos: {
        where: { activo: true },
        include: { estilo: true }
      }
    }
  });

  if (!alumno || !alumno.activo) return;

  const fechaActual = new Date();
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();
  const fechaVencimiento = new Date(anio, mes, 0); // Último día del mes

  for (const alumnoEstilo of alumno.alumnoEstilos) {
    const deudaExistente = await prisma.deuda.findFirst({
      where: {
        alumnoId,
        estiloId: alumnoEstilo.estiloId,
        mes: mes.toString(),
        anio,
        pagada: false
      }
    });

    if (!deudaExistente) {
      await prisma.deuda.create({
        data: {
          alumnoId,
          estiloId: alumnoEstilo.estiloId,
          monto: alumnoEstilo.estilo.importe,
          montoOriginal: alumnoEstilo.estilo.importe,
          mes: mes.toString(),
          anio,
          fechaVencimiento,
          pagada: false
        },
      });
    }
  }
}

export async function generarRecibo(
  alumnoId: number, 
  conceptoId: number, 
  monto: number, 
  tipoPago: TipoPago
) {
  const recibo = await prisma.recibo.create({
    data: {
      alumnoId,
      conceptoId,
      monto,
      montoOriginal: monto, // Agregamos este campo
      periodoPago: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      tipoPago,
      fecha: new Date(),
    }
  });

  const deudasPendientes = await prisma.deuda.findMany({
    where: {
      alumnoId,
      pagada: false
    },
    orderBy: [
      { anio: 'asc' },
      { mes: 'asc' }
    ]
  });

  let montoRestante = monto;

  for (const deuda of deudasPendientes) {
    if (montoRestante >= deuda.monto) {
      await prisma.deuda.update({
        where: { id: deuda.id },
        data: { pagada: true }
      });
      montoRestante -= deuda.monto;
    } else if (montoRestante > 0) {
      await prisma.deuda.update({
        where: { id: deuda.id },
        data: { monto: deuda.monto - montoRestante }
      });
      montoRestante = 0;
    } else {
      break;
    }
  }

  return recibo;
}

export async function darDeBajaAlumno(alumnoId: number) {
  await prisma.alumno.update({
    where: { id: alumnoId },
    data: { activo: false }
  });

  await prisma.alumnoEstilos.updateMany({
    where: { alumnoId },
    data: { activo: false }
  });
}

export async function reactivarAlumno(alumnoId: number) {
  await prisma.alumno.update({
    where: { id: alumnoId },
    data: { activo: true }
  });
}

export async function generarDeudasMensualesParaTodos() {
  const alumnosActivos = await prisma.alumno.findMany({
    where: { activo: true }
  });

  for (const alumno of alumnosActivos) {
    await generarDeudaMensual(alumno.id);
  }
}