// src/utils/dateUtils.ts
export const getArgentinaDateTime = (date?: string | Date): Date => {
  // Si se provee una fecha, usarla como base, sino usar la fecha actual
  const baseDate = date ? new Date(date) : new Date();
  
  // Convertir explícitamente a fecha y hora de Argentina
  const argentinaDateString = baseDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return new Date(argentinaDateString);
};

export const getArgentinaDayRange = (date?: Date): { start: Date; end: Date } => {
  const argentinaDate = getArgentinaDateTime(date);
  
  // Crear string para fecha de inicio en Argentina (00:00:00)
  const startString = argentinaDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).split(' ')[0] + ' 00:00:00';

  // Crear string para fecha de fin en Argentina (23:59:59)
  const endString = argentinaDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).split(' ')[0] + ' 23:59:59';

  // Convertir a objetos Date
  const start = new Date(startString);
  const end = new Date(endString);

  return { 
    start: new Date(start.getTime() - (3 * 60 * 60 * 1000)), // Ajuste UTC-3
    end: new Date(end.getTime() - (3 * 60 * 60 * 1000))      // Ajuste UTC-3
  };
};