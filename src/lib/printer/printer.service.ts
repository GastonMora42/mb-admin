import { ReciboWithRelations } from '@/types/recibos';
import type { Prisma } from '@prisma/client';

export class PrinterService {
  private bridgeUrl = 'http://localhost:3001';

  async init(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/getprinters`);
      const impresoras = await response.json();
      return impresoras.length > 0;
    } catch (error) {
      console.warn('Error inicializando impresora:', error);
      return false;
    }
  }

  async detectPrinter(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/getprinters`);
      const impresoras = await response.json();
      return impresoras.length > 0;
    } catch (error) {
      console.warn('Error detectando impresoras:', error);
      return false;
    }
  }

  async printTest(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/imprimir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_impresora: 'NEXUSPOSNX-58', // Nombre de tu impresora
          operaciones: [
            { accion: 'text', datos: '=== TEST DE IMPRESIÓN ===' },
            { accion: 'text', datos: new Date().toLocaleString() }
          ]
        })
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error en impresión de prueba:', error);
      return false;
    }
  }

  async printReceipt(recibo: ReciboWithRelations): Promise<{ success: boolean; message?: string }> {
    try {
      const operaciones = [
        // Encabezado
        { accion: 'text', datos: 'ESTUDIO DE DANZAS' },
        { accion: 'text', datos: 'DE MICAELA MEINDL' },
        
        // Información del recibo
        { accion: 'text', datos: `Recibo #: ${recibo.numeroRecibo}` },
        { accion: 'text', datos: `Fecha: ${new Date(recibo.fecha).toLocaleDateString()}` },
        { accion: 'text', datos: `Hora: ${new Date(recibo.fecha).toLocaleTimeString()}` },

        // Cliente
        { 
          accion: 'text', 
          datos: recibo.alumno 
            ? `Alumno: ${recibo.alumno.nombre} ${recibo.alumno.apellido}`
            : recibo.alumnoSuelto
            ? `Alumno Suelto: ${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido}`
            : 'Cliente no identificado'
        },

        // Concepto y montos
        { accion: 'text', datos: `Concepto: ${recibo.concepto.nombre}` },
        { accion: 'text', datos: `Monto Original: $${recibo.montoOriginal.toFixed(2)}` },

        // Descuentos
        ...(recibo.descuento ? [
          { 
            accion: 'text', 
            datos: `Descuento: ${(recibo.descuento * 100).toFixed(0)}%` 
          },
          { 
            accion: 'text', 
            datos: `Monto Descuento: -$${(recibo.montoOriginal * recibo.descuento).toFixed(2)}` 
          }
        ] : []),

        // Deudas pagadas
        ...(recibo.pagosDeuda?.length > 0 
          ? [{ accion: 'text', datos: 'Deudas Canceladas:' }]
          : []),
        ...(recibo.pagosDeuda?.map(pago => ({
          accion: 'text', 
          datos: `- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}`
        })) || []),

        // Total y forma de pago
        { accion: 'text', datos: `TOTAL: $${recibo.monto.toFixed(2)}` },
        { accion: 'text', datos: `Forma de pago: ${recibo.tipoPago}` },

        // Pie de página
        { accion: 'text', datos: '¡Gracias por su pago!' }
      ];

      const response = await fetch(`${this.bridgeUrl}/imprimir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_impresora: 'NEXUSPOSNX-58', // Nombre de tu impresora
          operaciones: operaciones
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error al imprimir:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al imprimir'
      };
    }
  }

  async checkStatus(): Promise<{ connected: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.bridgeUrl}/getprinters`);
      const impresoras = await response.json();
      return { 
        connected: impresoras.length > 0 
      };
    } catch (error) {
      return {
        connected: false,
        error: 'No se puede conectar con el servidor de impresión'
      };
    }
  }
}