// lib/printer/templates/receipt.template.ts
import { ThermalPrinter } from 'node-thermal-printer';
import type { Prisma } from '@prisma/client';

// Definir el tipo completo para Recibo con todas sus relaciones
type ReciboWithRelations = Prisma.ReciboGetPayload<{
  include: {
    alumno: true;
    alumnoSuelto: true;
    concepto: true;
    pagosDeuda: {
      include: {
        deuda: {
          include: {
            estilo: true;
          }
        }
      }
    }
  }
}>;

export const formatReceipt = async (
  printer: ThermalPrinter,
  recibo: ReciboWithRelations
): Promise<boolean> => {
  try {
    // Encabezado
    await printer.alignCenter();
    await printer.println("ESTUDIO DE DANZAS");
    await printer.println("DE MICAELA MEINDL");
    await printer.drawLine();

    // Información del recibo
    await printer.alignLeft();
    await printer.println(`Recibo #: ${recibo.numeroRecibo}`);
    await printer.println(`Fecha: ${new Date(recibo.fecha).toLocaleDateString()}`);

    // Información del cliente (manejo seguro de null)
    if (recibo.alumno) {
      await printer.println(`Alumno: ${recibo.alumno.nombre} ${recibo.alumno.apellido}`);
    } else if (recibo.alumnoSuelto) {
      await printer.println(`Alumno Suelto: ${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido}`);
    }

    // Concepto y monto
    await printer.println(`Concepto: ${recibo.concepto.nombre}`);
    await printer.println(`Monto Original: $${recibo.montoOriginal.toFixed(2)}`);

    // Descuento (si existe)
    if (recibo.descuento) {
      const descuentoPorcentaje = recibo.descuento * 100;
      await printer.println(`Descuento: ${descuentoPorcentaje.toFixed(0)}%`);
    }

    // Deudas pagadas (si existen)
    if (recibo.pagosDeuda && recibo.pagosDeuda.length > 0) {
      await printer.println('\nDeudas Canceladas:');
      for (const pago of recibo.pagosDeuda) {
        await printer.println(`- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}`);
      }
    }

    // Total
    await printer.drawLine();
    await printer.alignRight();
    await printer.println(`TOTAL: $${recibo.monto.toFixed(2)}`);
    await printer.println(`Forma de pago: ${recibo.tipoPago}`);

    // Pie de recibo
    await printer.drawLine();
    await printer.alignCenter();
    await printer.println('¡Gracias por su pago!');

    await printer.cut();
    await printer.execute();

    return true;
  } catch (error) {
    console.error('Error formateando recibo:', error);
    throw error;
  }
};