export const getArgentinaDateTime = (date?: string | Date): Date => {
  const baseDate = date ? new Date(date) : new Date();
  return new Date(baseDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }));
};

export const getArgentinaDayRange = (date?: string): { start: Date; end: Date } => {
  const baseDate = date ? new Date(date) : new Date();
  const argentinaDate = new Date(baseDate.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }));
  
  const start = new Date(argentinaDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(argentinaDate);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};