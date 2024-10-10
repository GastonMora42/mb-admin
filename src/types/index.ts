import { Alumno, Concepto, Recibo, Estilo, Profesor, CtaCte, Liquidacion, CajaDiaria } from '@prisma/client'

export type { Alumno, Concepto, Recibo, Estilo, Profesor, CtaCte, Liquidacion, CajaDiaria }

export type UserRole = 'Secretaria' | 'Profesor' | 'Dueño';

// Puedes agregar tipos adicionales aquí si es necesario