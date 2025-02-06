// src/utils/dateUtils.ts
export const getArgentinaDateTime = (date?: Date | string): Date => {
    const d = date ? new Date(date) : new Date();
    return new Date(d.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  };
  
  export const getArgentinaDayRange = (date?: Date): { start: Date; end: Date } => {
    const argDate = getArgentinaDateTime(date);
    const start = new Date(argDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(argDate);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };