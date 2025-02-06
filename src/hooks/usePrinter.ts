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
  const [printError, setPrintError] = useState<string | null>(null);

  const checkPrinterAvailability = useCallback(async () => {
    setIsInitializing(true);
    setPrintError(null);
    try {
      const isAvailable = await printerService.init();
      setIsPrinterAvailable(isAvailable);
      console.log('Estado de impresora:', isAvailable ? 'Disponible' : 'No disponible');
    } catch (error) {
      console.error('Error verificando impresora:', error);
      setIsPrinterAvailable(false);
      setPrintError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsInitializing(false);
    }
  }, [printerService]);

  useEffect(() => {
    checkPrinterAvailability();
    const intervalId = setInterval(checkPrinterAvailability, 60000); // Verificar cada minuto
    return () => clearInterval(intervalId);
  }, [checkPrinterAvailability]);

  const printReceipt = useCallback(async (recibo: any) => {
    setPrintError(null);
    try {
      if (!recibo || !recibo.id) {
        throw new Error('Recibo inválido');
      }

      const response = await fetch(`/api/recibos/${recibo.id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener recibo: ${response.status} - ${errorText}`);
      }

      const reciboCompleto = await response.json();
      
      const printResult = await printerService.printReceipt(reciboCompleto);
      
      if (!printResult.success) {
        setPrintError(printResult.message || 'Error de impresión');
      }

      return printResult;
    } catch (error) {
      console.error('Error en impresión de recibo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al imprimir';
      setPrintError(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }, [printerService]);

  return {
    isPrinterAvailable,
    isInitializing,
    printReceipt,
    printError,
    refreshPrinterStatus: checkPrinterAvailability
  };
}