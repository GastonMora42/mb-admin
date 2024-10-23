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
          mes: mes.toString(),
          anio,
        }
      });
    }
  }
}

export async function generarRecibo(
  alumnoId: number, 
  conceptoId: number, 
  monto: number, 
  tipoPago: TipoPago  // Cambiado de string a TipoPago
) {
  const recibo = await prisma.recibo.create({
    data: {
      alumnoId,
      conceptoId,
      monto,
      periodoPago: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      tipoPago, // Ahora tipoPago debe ser uno de los valores del enum
      fecha: new Date(),
    }
  });

  // Obtener todas las deudas pendientes del alumno
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

  // Saldar deudas
  for (const deuda of deudasPendientes) {
    if (montoRestante >= deuda.monto) {
      await prisma.deuda.update({
        where: { id: deuda.id },
        data: { pagada: true }
      });
      montoRestante -= deuda.monto;
    } else if (montoRestante > 0) {
      // Si queda un monto parcial, actualizamos la deuda
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

  // Desactivar todos los estilos del alumno
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