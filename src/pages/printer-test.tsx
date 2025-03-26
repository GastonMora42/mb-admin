// pages/printer-test.tsx
import { useState } from 'react';
import { PrinterService } from '@/lib/printer/printer.service';

import type { Prisma } from '@prisma/client';
import { PrinterChecker } from '@/utils/printerCheckList';

export default function PrinterTest() {
 const [printerStatus, setPrinterStatus] = useState<string>('No verificado');
 const [testResult, setTestResult] = useState<string>('');
 const [loading, setLoading] = useState(false);

 async function checkPrinter() {
   setLoading(true);
   try {
     const checker = new PrinterChecker();
     const diagnostics = await checker.runDiagnostics();
     setPrinterStatus(diagnostics.join('\n'));
   } catch (error) {
     setPrinterStatus('Error al verificar impresora');
   } finally {
     setLoading(false);
   }
 }

 async function printTest() {
   setLoading(true);
   const service = new PrinterService();
   try {
     const mockRecibo: Prisma.ReciboGetPayload<{
       include: {
         alumno: true;
         alumnoSuelto: true;
         concepto: true;
         pagosDeuda: {
           include: {
             deuda: {
               include: {
                 estilo: true
               }
             }
           }
         }
       }
     }> = {
       id: 1,
       numeroRecibo: 1001,
       fecha: new Date(),
       fechaEfecto: new Date(),
       monto: 100,
       montoOriginal: 100,
       alumnoId: null,
       conceptoId: 1,
       createdAt: new Date(),
       updatedAt: new Date(),
       periodoPago: 'TEST',
       tipoPago: 'EFECTIVO',
       fueraDeTermino: false,
       claseId: null,
       esClaseSuelta: false,
       alumnoSueltoId: null,
       anulado: false,
       descuento: null,
       esMesCompleto: false,
       motivoAnulacion: null,
       referenciaRecibo: null,
       alumno: null,
       alumnoSuelto: null,
       concepto: {
        id: 1,
        nombre: 'TEST',
        descripcion: null,
        // monto: 100, // Eliminar esta propiedad si ahora usan montoRegular y montoSuelto
        montoRegular: 100, // Añadir esta propiedad
        montoSuelto: 80,   // Añadir esta propiedad
        createdAt: new Date(),
        updatedAt: new Date(),
        estiloId: null,
        esInscripcion: false,
        // activo: true    // Eliminar esta propiedad
      },
       pagosDeuda: []
     };

     const result = await service.printReceipt(mockRecibo);
     setTestResult(result.success ? 'Impresión exitosa' : 'Error: ' + result.message);
   } catch (error) {
     setTestResult('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
   } finally {
     setLoading(false);
   }
 }

 return (
   <div className="p-6">
     <h1 className="text-2xl font-bold mb-4">Test de Impresora</h1>
     
     <div className="mb-4 p-4 bg-gray-100 rounded">
       <h2 className="font-semibold mb-2">Estado de la Impresora:</h2>
       <pre className="whitespace-pre-wrap">{printerStatus}</pre>
     </div>

     <div className="flex gap-4 mb-4">
       <button
         onClick={checkPrinter}
         disabled={loading}
         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
       >
         {loading ? 'Verificando...' : 'Verificar Impresora'}
       </button>
       
       <button
         onClick={printTest}
         disabled={loading}
         className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
       >
         {loading ? 'Imprimiendo...' : 'Imprimir Prueba'}
       </button>
     </div>

     {testResult && (
       <div className={`p-4 rounded ${
         testResult.includes('Error') 
           ? 'bg-red-100 text-red-700' 
           : 'bg-green-100 text-green-700'
       }`}>
         {testResult}
       </div>
     )}
   </div>
 );
}