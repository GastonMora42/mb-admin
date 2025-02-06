// src/utils/dateUtils.ts
export const getArgentinaDateTime = (date?: string | Date): Date => {
  // Si se provee una fecha, usarla como base, sino usar la fecha actual
  const baseDate = date ? new Date(date) : new Date();
  
  // Convertir la fecha a la zona horaria de Argentina
  return new Date(baseDate.toLocaleString('en-US', {
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE || 'America/Argentina/Buenos_Aires'
  }));
};

export const getArgentinaDayRange = (date?: Date): { start: Date; end: Date } => {
  const argentinaDate = getArgentinaDateTime(date);
  
  // Crear fecha de inicio (00:00:00.000)
  const start = new Date(argentinaDate);
  start.setHours(0, 0, 0, 0);
  
  // Crear fecha de fin (23:59:59.999)
  const end = new Date(argentinaDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};