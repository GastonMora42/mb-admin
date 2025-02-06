import { useState, useEffect, useCallback } from 'react';
import { PrinterService } from '@/lib/printer/printer.service';
import type { Prisma } from '@prisma/client';

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

export function usePrinter() {
  const [printerService] = useState(() => new PrinterService());
  const [isPrinterAvailable, setIsPrinterAvailable] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkPrinterAvailability = useCallback(async () => {
    setIsInitializing(true);
    try {
      const isAvailable = await printerService.init();
      setIsPrinterAvailable(isAvailable);
      
      // Añadir log adicional
      console.log('Estado de impresora:', isAvailable ? 'Disponible' : 'No disponible');
    } catch (error) {
      console.error('Error verificando impresora:', error);
      setIsPrinterAvailable(false);
    } finally {
      setIsInitializing(false);
    }
  }, [printerService]);

  useEffect(() => {
    checkPrinterAvailability();
  }, [checkPrinterAvailability]);

  const printReceipt = useCallback(async (recibo: any) => {
    try {
      // Validación adicional
      if (!recibo || !recibo.id) {
        throw new Error('Recibo inválido');
      }
  
      // Log antes del fetch
      console.log('Intentando obtener recibo:', recibo.id);
  
      // Fetch del recibo completo
      const response = await fetch(`/api/recibos/${recibo.id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener recibo: ${response.status} - ${errorText}`);
      }
  
      const reciboCompleto = await response.json();
      
      // Log de depuración
      console.log('Recibo completo obtenido:', reciboCompleto);
  
      // Imprimir
      const printResult = await printerService.printReceipt(reciboCompleto);
      
      // Log del resultado de impresión
      console.log('Resultado de impresión:', printResult);
  
      return printResult;
    } catch (error) {
      console.error('Error en impresión de recibo:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error desconocido al imprimir' 
      };
    }
  }, [printerService]);

  // Método para forzar verificación
  const refreshPrinterStatus = checkPrinterAvailability;

  return {
    isPrinterAvailable,
    isInitializing,
    printReceipt,
    refreshPrinterStatus  // Añadido para poder forzar refresco manual
  };
}