// lib/printer/printer.types.ts
export interface PrintResult {
    success: boolean;
    message?: string;
  }
  
  export interface PrinterStatus {
    isConnected: boolean;
    lastError?: string;
  }
  
// lib/printer/printer.types.ts
export interface PrinterCheckResult {
    driverInstalled: boolean;
    printerConnected: boolean;
    permissionsGranted: boolean;
    testPrintSuccessful: boolean;
    ready: boolean;
    error?: string;
  }