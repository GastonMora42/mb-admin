import { ReciboWithRelations } from '@/types/recibos';
import type { Prisma } from '@prisma/client';

export class PrinterService {
  private bridgeUrl = 'http://localhost:3001';
  private maxRetries = 3;
  private retryDelay = 2000; // 2 segundos entre reintentos

  private async retryFetch(url: string, options: RequestInit = {}, retries = this.maxRetries): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Reintento ${this.maxRetries - retries + 1}...`, error);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryFetch(url, options, retries - 1);
      }
      throw error;
    }
  }

  async init(): Promise<boolean> {
    try {
      const response = await this.retryFetch(`${this.bridgeUrl}/getprinters`);
      const impresoras = await response.json();
      return impresoras.length > 0;
    } catch (error) {
      console.warn('Error inicializando impresora:', error);
      return false;
    }
  }

  async checkDriver(): Promise<boolean> {
    try {
      const response = await this.retryFetch(`${this.bridgeUrl}/status`);
      const status = await response.json();
      return status.running === true;
    } catch (error) {
      console.warn('Error verificando driver:', error);
      return false;
    }
  }

  async detectPrinter(): Promise<boolean> {
    try {
      const response = await this.retryFetch(`${this.bridgeUrl}/getprinters`);
      const impresoras = await response.json();
      return impresoras.length > 0;
    } catch (error) {
      console.warn('Error detectando impresoras:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const response = await this.retryFetch(`${this.bridgeUrl}/getprinters`);
      const impresoras = await response.json();
      return impresoras.length > 0;
    } catch (error) {
      console.warn('Error verificando permisos:', error);
      return false;
    }
  }

  async printTest(): Promise<boolean> {
    try {
      const response = await this.retryFetch(`${this.bridgeUrl}/imprimir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_impresora: 'POS-58',
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

  private prepareReceiptOperations(recibo: ReciboWithRelations): Array<{accion: string, datos: string}> {
    return [
      { accion: 'text', datos: 'ESTUDIO DE DANZAS' },
      { accion: 'text', datos: 'DE MICAELA MEINDL' },
      { accion: 'text', datos: `Recibo #: ${recibo.numeroRecibo || 'N/A'}` },
      { accion: 'text', datos: `Fecha: ${new Date(recibo.fecha).toLocaleDateString()}` },
      { accion: 'text', datos: `Hora: ${new Date(recibo.fecha).toLocaleTimeString()}` },
      { 
        accion: 'text', 
        datos: recibo.alumno 
          ? `Alumno: ${recibo.alumno.nombre} ${recibo.alumno.apellido}`
          : recibo.alumnoSuelto
          ? `Alumno Suelto: ${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido}`
          : 'Cliente no identificado'
      },
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
      { accion: 'text', datos: `TOTAL: $${recibo.monto.toFixed(2)}` },
      { accion: 'text', datos: `Forma de pago: ${recibo.tipoPago}` },
      { accion: 'text', datos: '¡Gracias por su pago!' }
    ];

    
  }
  
  async printReceipt(recibo: ReciboWithRelations): Promise<{ success: boolean; message?: string }> {
    try {
      // Preparar las operaciones de impresión
      const operaciones = this.prepareReceiptOperations(recibo);
  
      // Usar retryFetch en lugar de fetch directo
      const response = await this.retryFetch(`${this.bridgeUrl}/imprimir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_impresora: 'POS-58',
          operaciones: operaciones
        })
      });
  
      const result = await response.json();
      
      if (!result.success) {
        console.warn('Intento de impresión fallido, probando método alternativo...');
        await this.fallbackPrint(recibo);
        return { success: true, message: 'Impreso usando método alternativo' };
      }
  
      return { 
        success: true, 
        message: 'Recibo impreso correctamente' 
      };
  
    } catch (error) {
      console.error('Error al imprimir:', error);
      try {
        // Intentar método alternativo si falla el principal
        await this.fallbackPrint(recibo);
        return { 
          success: true, 
          message: 'Impreso usando método alternativo después de error' 
        };
      } catch (fallbackError) {
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error desconocido en la impresión' 
        };
      }
    }
  }

  private async fallbackPrint(recibo: ReciboWithRelations): Promise<void> {
    const texto = this.prepareReceiptOperations(recibo)
      .map(op => op.datos)
      .join('\n');

    const response = await this.retryFetch(`${this.bridgeUrl}/imprimir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_impresora: 'POS-58',
        operaciones: [{ accion: 'text', datos: texto }]
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Método alternativo de impresión falló');
    }
  }

  async checkStatus(): Promise<{ connected: boolean; error?: string }> {
    try {
      const response = await this.retryFetch(`${this.bridgeUrl}/getprinters`);
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