// src/lib/printer/printer.service.ts
import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer';
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

interface PrinterConfig {
  type: PrinterTypes;
  interface: string;
  width: number;
  characterSet: CharacterSet;
  removeSpecialCharacters: boolean;
  options?: {
    timeout?: number;
  };
}

export class PrinterService {
  private bridgeUrl = 'http://localhost:3001';
  private printer: ThermalPrinter | null = null;
  private isConnected: boolean = false;
  private config: PrinterConfig = {
    type: PrinterTypes.EPSON,
    interface: 'printer:NexusPos58',
    width: 58,
    characterSet: CharacterSet.ISO8859_15_LATIN9,
    removeSpecialCharacters: false,
    options: {
      timeout: 5000
    }
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.printer = new ThermalPrinter(this.config);
      } catch (error) {
        console.warn('Error al inicializar la impresora:', error);
        this.printer = null;
      }
    }
  }

  private async ensurePrinterAvailable(): Promise<boolean> {
    if (!this.printer) {
      console.warn('Impresora no inicializada');
      return false;
    }
    return true;
  }

  async detectPrinter(): Promise<boolean> {
    try {
      // Primero intentamos detectar a través del bridge
      const response = await fetch(`${this.bridgeUrl}/status`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.warn('Bridge no disponible, intentando detección directa...');
    }

    // Si el bridge no está disponible, intentamos detección directa
    if (typeof window === 'undefined' || !navigator.usb) {
      console.warn('USB API no disponible');
      return false;
    }

    try {
      const devices = await navigator.usb.getDevices();
      console.log('Dispositivos USB encontrados:', devices);
      const printer = devices.find(device => 
        device.vendorId === 0x0416 // ID para NexusPos
      );
      return !!printer;
    } catch (error) {
      console.error('Error detectando impresora:', error);
      return false;
    }
  }

  async checkDriver(): Promise<boolean> {
    if (!await this.ensurePrinterAvailable()) return false;
    
    try {
      return await this.printer!.isPrinterConnected();
    } catch (error) {
      console.error('Error verificando driver:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.usb) {
      return false;
    }

    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ 
          vendorId: 0x0416
        }]
      });
      return !!device;
    } catch (error) {
      console.error('Error solicitando permisos USB:', error);
      return false;
    }
  }

  async init(): Promise<boolean> {
    // Primero intentamos inicializar a través del bridge
    try {
      const status = await this.checkStatus();
      if (status.connected) {
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      console.warn('No se pudo inicializar a través del bridge');
    }

    // Si el bridge no está disponible, intentamos inicialización directa
    if (!await this.ensurePrinterAvailable()) return false;

    try {
      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        console.warn('No hay permisos para la impresora');
        return false;
      }

      const isConnected = await this.printer!.isPrinterConnected();
      this.isConnected = isConnected;
      return isConnected;
    } catch (error) {
      console.error('Error inicializando impresora:', error);
      this.isConnected = false;
      return false;
    }
  }

  async printTest(): Promise<boolean> {
    // Primero intentamos a través del bridge
    try {
      const response = await fetch(`${this.bridgeUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          message: "=== TEST DE IMPRESIÓN ==="
        })
      });
      if (response.ok) return true;
    } catch (error) {
      console.warn('No se pudo imprimir a través del bridge, intentando impresión directa...');
    }

    // Si el bridge no está disponible, intentamos impresión directa
    if (!this.isConnected || !await this.ensurePrinterAvailable()) return false;

    try {
      await this.printer!.alignCenter();
      await this.printer!.println("=== TEST DE IMPRESIÓN ===");
      await this.printer!.println(new Date().toLocaleString());
      await this.printer!.drawLine();
      await this.printer!.println("Impresora funcionando correctamente");
      await this.printer!.cut();
      await this.printer!.execute();
      return true;
    } catch (error) {
      console.error('Error en impresión de prueba:', error);
      return false;
    }
  }

  async printReceipt(recibo: ReciboWithRelations): Promise<{ success: boolean; message?: string }> {
    // Primero intentamos imprimir a través del bridge
    try {
      const response = await fetch(`${this.bridgeUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recibo)
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.warn('No se pudo imprimir a través del bridge, intentando impresión directa...');
    }

    // Si el bridge no está disponible, intentamos impresión directa
    if (!this.isConnected || !await this.ensurePrinterAvailable()) {
      return { success: false, message: 'Impresora no disponible' };
    }

    try {
      // Encabezado
      await this.printer!.alignCenter();
      await this.printer!.setTextSize(1, 1);
      await this.printer!.bold(true);
      await this.printer!.println("ESTUDIO DE DANZAS");
      await this.printer!.println("DE MICAELA MEINDL");
      await this.printer!.bold(false);
      await this.printer!.setTextNormal();
      await this.printer!.drawLine();

      // Información del recibo
      await this.printer!.alignLeft();
      await this.printer!.println(`Recibo #: ${recibo.numeroRecibo}`);
      await this.printer!.println(`Fecha: ${new Date(recibo.fecha).toLocaleDateString()}`);
      await this.printer!.println(`Hora: ${new Date(recibo.fecha).toLocaleTimeString()}`);

      // Cliente
      if (recibo.alumno) {
        await this.printer!.println(`Alumno: ${recibo.alumno.nombre} ${recibo.alumno.apellido}`);
      } else if (recibo.alumnoSuelto) {
        await this.printer!.println(`Alumno Suelto: ${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido}`);
      }

      await this.printer!.drawLine();

      // Concepto y montos
      await this.printer!.println(`Concepto: ${recibo.concepto.nombre}`);
      await this.printer!.println(`Monto Original: $${recibo.montoOriginal.toFixed(2)}`);

      // Descuentos
      if (recibo.descuento) {
        const descuentoPorcentaje = recibo.descuento * 100;
        await this.printer!.println(`Descuento: ${descuentoPorcentaje.toFixed(0)}%`);
        const montoDescuento = recibo.montoOriginal * recibo.descuento;
        await this.printer!.println(`Monto Descuento: -$${montoDescuento.toFixed(2)}`);
      }

      // Deudas pagadas
      if (recibo.pagosDeuda?.length > 0) {
        await this.printer!.println('\nDeudas Canceladas:');
        for (const pago of recibo.pagosDeuda) {
          await this.printer!.println(`- ${pago.deuda.estilo.nombre}: $${pago.monto.toFixed(2)}`);
        }
      }

      // Total y forma de pago
      await this.printer!.drawLine();
      await this.printer!.bold(true);
      await this.printer!.alignRight();
      await this.printer!.println(`TOTAL: $${recibo.monto.toFixed(2)}`);
      await this.printer!.bold(false);
      await this.printer!.println(`Forma de pago: ${recibo.tipoPago}`);

      // Pie de página
      await this.printer!.drawLine();
      await this.printer!.alignCenter();
      await this.printer!.println('¡Gracias por su pago!');
      
      // Finalizar
      await this.printer!.cut();
      await this.printer!.execute();

      return { success: true };
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
      const response = await fetch(`${this.bridgeUrl}/status`);
      const data = await response.json();
      return { connected: data.status === 'running' };
    } catch (error) {
      return {
        connected: false,
        error: 'No se puede conectar con el servidor de impresión'
      };
    }
  }
}