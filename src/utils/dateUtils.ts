// src/utils/dateUtils.ts
export const getArgentinaDateTime = (date?: string | Date): Date => {
  // Convertir a fecha base UTC
  const baseDate = date ? new Date(date + 'T00:00:00.000Z') : new Date();
  
  // Crear fecha en zona horaria Argentina
  const argentinaDate = new Date(baseDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }));

  // Ajustar al UTC correcto para Argentina (UTC-3)
  return new Date(argentinaDate.getTime() - (3 * 60 * 60 * 1000));
};

export const getArgentinaDayRange = (date?: string): { start: Date; end: Date } => {
  const baseDate = date ? new Date(date + 'T00:00:00.000Z') : new Date();
  
  // Inicio del día en Argentina
  const start = new Date(baseDate);
  start.setUTCHours(3, 0, 0, 0); // 00:00:00 Argentina = 03:00:00 UTC
  
  // Fin del día en Argentina
  const end = new Date(baseDate);
  end.setUTCHours(26, 59, 59, 999); // 23:59:59 Argentina = 02:59:59 UTC (siguiente día)

  return { start, end };
};