// utils/descuentos.ts
import prisma from '@/lib/prisma'

export async function calcularDescuentoAutomatico(alumnoId: number) {
  try {
    // Contar estilos activos del alumno
    const estilosActivos = await prisma.alumnoEstilos.count({
      where: {
        alumnoId,
        activo: true
      }
    });

    // Buscar descuento automático aplicable
    const descuentoAutomatico = await prisma.descuento.findFirst({
      where: {
        esAutomatico: true,
        activo: true,
        minEstilos: {
          lte: estilosActivos
        }
      },
      orderBy: {
        porcentaje: 'desc' // Tomar el descuento más alto aplicable
      }
    });

    return descuentoAutomatico;
  } catch (error) {
    console.error('Error al calcular descuento automático:', error);
    return null;
  }
}