// hooks/usePrinter.ts
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

  useEffect(() => {
    async function initPrinter() {
      setIsInitializing(true);
      try {
        const isAvailable = await printerService.init();
        setIsPrinterAvailable(isAvailable);
      } catch (error) {
        console.error('Error inicializando impresora:', error);
        setIsPrinterAvailable(false);
      } finally {
        setIsInitializing(false);
      }
    }
    initPrinter();
  }, [printerService]);

  const printReceipt = useCallback(async (recibo: any) => {
    // Asegurarse de que el recibo tenga todas las relaciones necesarias
    const reciboCompleto = await fetch(`/api/recibos/${recibo.id}?include=all`)
      .then(res => res.json()) as ReciboWithRelations;
    
    return printerService.printReceipt(reciboCompleto);
  }, [printerService]);

  return {
    isPrinterAvailable,
    isInitializing,
    printReceipt
  };
}