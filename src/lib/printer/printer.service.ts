import { ReciboWithRelations } from '@/types/recibos';
import type { Prisma } from '@prisma/client';

export class PrinterService {
 private bridgeUrl = 'http://localhost:3001';
 private maxRetries = 3;
 private retryDelay = 2000;

 private async retryFetch(url: string, options: RequestInit = {}, retries = this.maxRetries): Promise<Response> {
   try {
     const response = await fetch(url, options);
     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     return response;
   } catch (error) {
     if (retries > 0) {
       await new Promise(resolve => setTimeout(resolve, this.retryDelay));
       return this.retryFetch(url, options, retries - 1);
     }
     throw error;
   }
 }

 async init(): Promise<boolean> {
   try {
     const response = await this.retryFetch(`${this.bridgeUrl}/status`);
     const status = await response.json();
     return status.running === true;
   } catch {
     return false;
   }
 }

 async checkDriver(): Promise<boolean> {
   try {
     const response = await this.retryFetch(`${this.bridgeUrl}/status`);
     const status = await response.json();
     return status.running === true;
   } catch {
     return false;
   }
 }

 async detectPrinter(): Promise<boolean> {
   try {
     const response = await this.retryFetch(`${this.bridgeUrl}/getprinters`);
     const impresoras = await response.json();
     return impresoras.includes('POS-58');
   } catch {
     return false;
   }
 }

 async checkPermissions(): Promise<boolean> {
   try {
     const response = await this.retryFetch(`${this.bridgeUrl}/status`);
     const status = await response.json();
     return status.running === true;
   } catch {
     return false;
   }
 }

 async printTest(): Promise<boolean> {
   try {
     const response = await this.retryFetch(`${this.bridgeUrl}/imprimir`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         nombre_impresora: 'POS-58',
         operaciones: [
           { accion: 'text', datos: '\n=== TEST DE IMPRESIÓN ===\n' },
           { accion: 'text', datos: `${new Date().toLocaleString()}\n\n\n` }
         ]
       })
     });
     const result = await response.json();
     return result.success;
   } catch {
     return false;
   }
 }

 private readonly LOGO_PATH = './public/mb-logo.png';

 async printReceipt(recibo: ReciboWithRelations): Promise<{ success: boolean; message?: string }> {
  try {
    const operaciones = [
      { 
        accion: 'image', 
        datos: this.LOGO_PATH
      },
      { accion: 'text', datos: '\n\n\n\n' },  // Espacio después del logo
      { accion: 'text', datos: '\n         ESTUDIO DE DANZAS\n' },
      { accion: 'text', datos: '\n\n\n' },    // Separación después del encabezado
      { accion: 'text', datos: `Recibo #: ${recibo.numeroRecibo || 'N/A'}\n\n` },
      { accion: 'text', datos: `Fecha: ${new Date(recibo.fecha).toLocaleDateString()}\n` },
      { accion: 'text', datos: `Hora: ${new Date(recibo.fecha).toLocaleTimeString()}\n\n` },
      { accion: 'text', datos: '\n' },
      { 
        accion: 'text', 
        datos: recibo.alumno 
          ? `Alumno: ${recibo.alumno.nombre} ${recibo.alumno.apellido}\n\n`
          : `Alumno Suelto: ${recibo.alumnoSuelto?.nombre} ${recibo.alumnoSuelto?.apellido}\n\n`
      },
      { accion: 'text', datos: `Concepto: ${recibo.concepto.nombre}\n\n` },
      { accion: 'text', datos: '\n\n' },      // Separación antes de los montos
      { accion: 'text', datos: `Monto Original: $${recibo.montoOriginal.toFixed(2)}\n\n` },
      ...(recibo.descuento ? [
        { accion: 'text', datos: `Descuento: ${(recibo.descuento * 100).toFixed(0)}%\n` },
        { accion: 'text', datos: `Monto Descuento: -$${(recibo.montoOriginal * recibo.descuento).toFixed(2)}\n\n` }
      ] : []),
      ...(recibo.pagosDeuda?.length ? [
        { accion: 'text', datos: '\n\nDeudas Canceladas:\n\n' },
        ...recibo.pagosDeuda.map(pago => ({
          accion: 'text', 
          datos: `- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}\n\n`
        }))
      ] : []),
      { accion: 'text', datos: '\n\n' },      // Separación antes del total
      { accion: 'text', datos: `TOTAL: $${recibo.monto.toFixed(2)}\n\n` },
      { accion: 'text', datos: `Forma de pago: ${recibo.tipoPago}\n\n` },
      { accion: 'text', datos: '\n\n' },
      { accion: 'text', datos: '           ¡Gracias por su pago!\n' },
      { accion: 'text', datos: '\n\n\n\n\n\n' }  // Espacio final para corte
    ];

    const response = await this.retryFetch(`${this.bridgeUrl}/imprimir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_impresora: 'POS-58',
        operaciones
      })
    });

     const result = await response.json();
     if (!result.success) {
       return await this.fallbackPrint(recibo);
     }
     return { success: true };
   } catch (error) {
     return { 
       success: false, 
       message: error instanceof Error ? error.message : 'Error en impresión'
     };
   }
 }

 private async fallbackPrint(recibo: ReciboWithRelations): Promise<{ success: boolean; message?: string }> {
   try {
     const texto = this.prepareReceiptOperations(recibo)
       .map(op => op.datos)
       .join('\n');
       
     const response = await this.retryFetch(`${this.bridgeUrl}/imprimir`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         nombre_impresora: 'POS-58',
         operaciones: [{ accion: 'text', datos: texto }]
       })
     });
     
     const result = await response.json();
     return result.success
       ? { success: true, message: 'Impreso usando método alternativo' }
       : { success: false, message: 'Método alternativo de impresión falló' };
   } catch (error) {
     return { 
       success: false, 
       message: error instanceof Error ? error.message : 'Error en impresión alternativa'
     };
   }
 }

 private prepareReceiptOperations(recibo: ReciboWithRelations): Array<{accion: string, datos: string}> {
  return [
    { accion: 'image', datos: 'mb-logo.png' },
    { accion: 'text', datos: '\n\n\n\n' },
    { accion: 'text', datos: '\n         ESTUDIO DE DANZAS\n' },
    { accion: 'text', datos: `Recibo #: ${recibo.numeroRecibo || 'N/A'}\n\n` },
    { accion: 'text', datos: `Fecha: ${new Date(recibo.fecha).toLocaleDateString()}\n` },
    { accion: 'text', datos: `Hora: ${new Date(recibo.fecha).toLocaleTimeString()}\n\n` },
    { 
      accion: 'text', 
      datos: recibo.alumno 
        ? `Alumno: ${recibo.alumno.nombre} ${recibo.alumno.apellido}\n\n`
        : recibo.alumnoSuelto
        ? `Alumno Suelto: ${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido}\n\n`
        : 'Cliente no identificado\n\n'
    },
    { accion: 'text', datos: `Concepto: ${recibo.concepto.nombre}\n\n` },
    { accion: 'text', datos: '\n\n' },
    { accion: 'text', datos: `Monto Original: $${recibo.montoOriginal.toFixed(2)}\n\n` },
    ...(recibo.descuento ? [
      { accion: 'text', datos: `Descuento: ${(recibo.descuento * 100).toFixed(0)}%\n` },
      { accion: 'text', datos: `Monto Descuento: -$${(recibo.montoOriginal * recibo.descuento).toFixed(2)}\n\n` }
    ] : []),
    ...(recibo.pagosDeuda?.length ? [
      { accion: 'text', datos: '\n\nDeudas Canceladas:\n\n' },
      ...recibo.pagosDeuda.map(pago => ({
        accion: 'text', 
        datos: `- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}\n\n`
      }))
    ] : []),
    { accion: 'text', datos: '\n\n' },
    { accion: 'text', datos: `TOTAL: $${recibo.monto.toFixed(2)}\n\n` },
    { accion: 'text', datos: `Forma de pago: ${recibo.tipoPago}\n\n` },
    { accion: 'text', datos: '\n\n' },
    { accion: 'text', datos: '           ¡Gracias por su pago!\n' },
    { accion: 'text', datos: '\n\n\n\n\n\n' }
  ];
}

 async checkStatus(): Promise<{ connected: boolean; error?: string }> {
   try {
     const [statusResponse, printersResponse] = await Promise.all([
       this.retryFetch(`${this.bridgeUrl}/status`),
       this.retryFetch(`${this.bridgeUrl}/getprinters`)
     ]);

     const status = await statusResponse.json();
     const printers = await printersResponse.json();

     return { 
       connected: status.running && printers.includes('POS-58')
     };
   } catch {
     return {
       connected: false,
       error: 'Error de conexión con el servidor de impresión'
     };
   }
 }
}