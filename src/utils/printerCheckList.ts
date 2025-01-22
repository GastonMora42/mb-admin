// lib/printer/printerCheckList.ts

import { PrinterService } from "@/lib/printer/printer.service";
import { PrinterCheckResult } from "@/lib/printer/printer.types";


export class PrinterChecker {
  private service: PrinterService;

  constructor() {
    this.service = new PrinterService();
  }

  async verifyPrinterSetup(): Promise<PrinterCheckResult> {
    const checks = {
      driverInstalled: false,
      printerConnected: false,
      permissionsGranted: false,
      testPrintSuccessful: false
    };

    try {
      // Verificar driver
      checks.driverInstalled = await this.service.checkDriver();
      
      // Verificar conexión
      checks.printerConnected = await this.service.detectPrinter();
      
      // Verificar permisos
      checks.permissionsGranted = await this.service.checkPermissions();
      
      // Realizar impresión de prueba si todo lo anterior está OK
      if (checks.printerConnected && checks.permissionsGranted) {
        checks.testPrintSuccessful = await this.service.printTest();
      }

      return {
        ...checks,
        ready: Object.values(checks).every(check => check)
      };
      
    } catch (error) {
      console.error('Error verificando impresora:', error);
      return {
        ...checks,
        ready: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async runDiagnostics(): Promise<string[]> {
    const messages: string[] = [];
    const result = await this.verifyPrinterSetup();

    if (!result.driverInstalled) {
      messages.push('❌ Driver no instalado');
    }
    if (!result.printerConnected) {
      messages.push('❌ Impresora no conectada');
    }
    if (!result.permissionsGranted) {
      messages.push('❌ Permisos no otorgados');
    }
    if (!result.testPrintSuccessful) {
      messages.push('❌ Test de impresión fallido');
    }

    if (messages.length === 0) {
      messages.push('✅ Todo OK');
    }

    return messages;
  }
}