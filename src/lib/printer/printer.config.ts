// lib/printer/printer.config.ts
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';

export const printerConfig = {
  type: PrinterTypes.EPSON,
  interface: 'printer:NexusPos58',
  width: 58,
  characterSet: 'SPAIN1',
  removeSpecialCharacters: false,
  options: {
    timeout: 5000
  }
};