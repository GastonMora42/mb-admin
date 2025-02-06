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

 async printReceipt(recibo: ReciboWithRelations): Promise<{ success: boolean; message?: string }> {
   try {
     const operaciones = [
       { accion: 'text', datos: '\n\nESTUDIO DE DANZAS' },
       { accion: 'text', datos: 'DE MICAELA MEINDL' },
       { accion: 'text', datos: `\nRecibo #: \n\n\n${recibo.numeroRecibo || 'N/A'}` },
       { accion: 'text', datos: `Fecha: \n\n\n${new Date(recibo.fecha).toLocaleDateString()}` },
       { accion: 'text', datos: `Hora: \n\n\n${new Date(recibo.fecha).toLocaleTimeString()}` },
       { accion: 'text', datos: recibo.alumno 
           ? `Alumno: \n\n\n${recibo.alumno.nombre} ${recibo.alumno.apellido}`
           : `Alumno Suelto: \n\n\n ${recibo.alumnoSuelto?.nombre} ${recibo.alumnoSuelto?.apellido}`
       },
       { accion: 'text', datos: `\nConcepto:\n\n\n ${recibo.concepto.nombre}` },
       { accion: 'text', datos: `Monto Original:\n\n\n $${recibo.montoOriginal.toFixed(2)}` },
       ...(recibo.descuento ? [
         { accion: 'text', datos: `Descuento: ${(recibo.descuento * 100).toFixed(0)}%` },
         { accion: 'text', datos: `Monto Descuento: -$\n\n\n${(recibo.montoOriginal * recibo.descuento).toFixed(2)}` }
       ] : []),
       ...(recibo.pagosDeuda?.length ? [
         { accion: 'text', datos: '\nDeudas Canceladas: \n\n\n' },
         ...recibo.pagosDeuda.map(pago => ({
           accion: 'text', 
           datos: `- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}`
         }))
       ] : []),
       { accion: 'text', datos: `\nTOTAL:\n\n\n $${recibo.monto.toFixed(2)}` },
       { accion: 'text', datos: `Forma de pago: \n\n\n${recibo.tipoPago}` },
       { accion: 'text', datos: '\n¡Gracias por su pago!\n\n\n' }
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
     ...(recibo.descuento ? [
       { accion: 'text', datos: `Descuento: ${(recibo.descuento * 100).toFixed(0)}%` },
       { accion: 'text', datos: `Monto Descuento: -$${(recibo.montoOriginal * recibo.descuento).toFixed(2)}` }
     ] : []),
     ...(recibo.pagosDeuda?.length ? [
       { accion: 'text', datos: 'Deudas Canceladas:' },
       ...recibo.pagosDeuda.map(pago => ({
         accion: 'text', 
         datos: `- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}`
       }))
     ] : []),
     { accion: 'text', datos: `TOTAL: $${recibo.monto.toFixed(2)}` },
     { accion: 'text', datos: `Forma de pago: ${recibo.tipoPago}` },
     { accion: 'text', datos: '¡Gracias por su pago!' }
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