export function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
  }
  