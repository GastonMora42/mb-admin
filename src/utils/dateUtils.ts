// src/utils/dateUtils.ts
export const getArgentinaDateTime = (date?: string | Date): Date => {
  // Si se provee una fecha, usarla como base, sino usar la fecha actual
  const baseDate = date ? new Date(date) : new Date();
  
  // Convertir la fecha a la zona horaria de Argentina
  const argentinaDate = new Date(baseDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }));

  // Ajuste para producción si es necesario
  if (process.env.NODE_ENV === 'production') {
    // Asegurar que la fecha esté en UTC-3
    return new Date(argentinaDate.getTime() - (argentinaDate.getTimezoneOffset() + 180) * 60000);
  }

  return argentinaDate;
};

export const getArgentinaDayRange = (date?: Date): { start: Date; end: Date } => {
  const argentinaDate = getArgentinaDateTime(date);
  
  // Crear fecha de inicio (00:00:00.000)
  const start = new Date(argentinaDate);
  start.setHours(0, 0, 0, 0);
  
  // Crear fecha de fin (23:59:59.999)
  const end = new Date(argentinaDate);
  end.setHours(23, 59, 59, 999);

  // Si estamos en producción, ajustar al UTC correcto
  if (process.env.NODE_ENV === 'production') {
    return {
      start: new Date(start.getTime() - (start.getTimezoneOffset() + 180) * 60000),
      end: new Date(end.getTime() - (end.getTimezoneOffset() + 180) * 60000)
    };
  }

  return { start, end };
};