// utils/alumnoUtils.ts

import { PrismaClient, Alumno, Estilo, Deuda, Recibo, TipoPago, TipoModalidad } from '@prisma/client';

const prisma = new PrismaClient();

export async function generarDeudaMensual(alumnoId: number) {
  const alumno = await prisma.alumno.findUnique({
    where: { id: alumnoId },
    include: { 
      alumnoEstilos: {
        where: { activo: true },
        include: { 
          estilo: true,
          modalidad: true // Incluir la modalidad
        }
      }
    }
  });

  if (!alumno || !alumno.activo) return;

  const fechaActual = new Date();
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();
  const fechaVencimiento = new Date(anio, mes, 0); // Último día del mes

  for (const alumnoEstilo of alumno.alumnoEstilos) {
    // Buscar el concepto asociado al estilo (no inscripción)
    const concepto = await prisma.concepto.findFirst({
      where: {
        estiloId: alumnoEstilo.estiloId,
        esInscripcion: false
      }
    });

    if (!concepto) {
      console.error(`No se encontró concepto para el estilo ID ${alumnoEstilo.estiloId}`);
      continue;
    }

    // Verificar si ya existe una deuda para este mes/año/estilo
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
          // Usar el monto según la modalidad con valores predeterminados para casos nulos
          const montoValor = alumnoEstilo.modalidad?.tipo === TipoModalidad.REGULAR
            ? (concepto.montoRegular ?? 0) // Usar 0 si es null
            : (concepto.montoSuelto ?? 0); // Usar 0 si es null
    
          await prisma.deuda.create({
            data: {
              alumnoId,
              estiloId: alumnoEstilo.estiloId,
              conceptoId: concepto.id,
              monto: montoValor, // Usar la variable con el valor predeterminado
              mes: mes.toString(),
              anio,
              tipoDeuda: alumnoEstilo.modalidad?.tipo || TipoModalidad.REGULAR,
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
      montoOriginal: monto,
      periodoPago: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      tipoPago,
      fecha: new Date(),
      fechaEfecto: new Date(), // Agregar fechaEfecto que ahora es obligatorio
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
      // Crear un pago de deuda
      await prisma.pagoDeuda.create({
        data: {
          deudaId: deuda.id,
          reciboId: recibo.id,
          monto: deuda.monto,
          fecha: new Date()
        }
      });
      
      await prisma.deuda.update({
        where: { id: deuda.id },
        data: { pagada: true }
      });
      
      montoRestante -= deuda.monto;
    } else if (montoRestante > 0) {
      // Crear un pago parcial
      await prisma.pagoDeuda.create({
        data: {
          deudaId: deuda.id,
          reciboId: recibo.id,
          monto: montoRestante,
          fecha: new Date()
        }
      });
      
      // No actualizamos el monto de la deuda, solo registramos el pago parcial
      // La deuda se marcará como pagada cuando la suma de pagos alcance el monto total
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
    data: { 
      activo: false,
      fechaBaja: new Date(),
      motivoBaja: 'Baja solicitada por el usuario'
    }
  });

  await prisma.alumnoEstilos.updateMany({
    where: { alumnoId, activo: true },
    data: { 
      activo: false,
      fechaFin: new Date()
    }
  });
}

export async function reactivarAlumno(alumnoId: number) {
  await prisma.alumno.update({
    where: { id: alumnoId },
    data: { 
      activo: true,
      fechaBaja: null,
      motivoBaja: null
    }
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