import { ReactNode } from "react";

export type Alumno = {
    descuentosVigentes: any;
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    activo: boolean;
    fechaNacimiento: Date;
    email: string | null;
    telefono: string | null;
    numeroEmergencia: string | null;
    direccion: string | null;
    obraSocial: string | null;
    nombreTutor: string | null;
    dniTutor: string | null;
    notas: string | null;
    fechaIngreso: Date;
    recibos: Recibo[];
    ctaCte: CtaCte | null;
    alumnoEstilos: AlumnoEstilo[];
    asistencias: Asistencia[];
    deudas: Deuda[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Estilo = {
    importe: any;
    id: number;
    nombre: string;
    monto: number; 
    descripcion: string | null;
    profesorId: number | null;
    profesor: Profesor | null;
    alumnoEstilos: AlumnoEstilo[];
    deudas: Deuda[];
    conceptos: Concepto[];
    clases: Clase[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type AlumnoEstilo = {
    alumno: Alumno;
    alumnoId: number;
    estilo: Estilo;
    estiloId: number;
    activo: boolean;
    fechaInicio: Date;
    fechaFin?: Date;
  };
  
 // Actualizar el tipo Deuda:
export type Deuda = {
  id: number;
  alumno: Alumno;
  alumnoId: number;
  monto: number;
  montoOriginal: number;
  mes: string;
  anio: number;
  estilo: Estilo;
  estiloId: number;
  pagada: boolean;
  fechaPago?: Date;
  fechaVencimiento: Date;
  pagos: PagoDeuda[];
  createdAt: Date;
  updatedAt: Date;
};
  
  export type Concepto = {
    id: number;
    nombre: string;
    descripcion: string | null;
    monto: number;
    estiloId: number | null;
    estilo: Estilo | null;
    recibos: Recibo[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export enum TipoPago {
    EFECTIVO = 'EFECTIVO',
    MERCADO_PAGO = 'MERCADO_PAGO',
    TRANSFERENCIA = 'TRANSFERENCIA',
    DEBITO_AUTOMATICO = 'DEBITO_AUTOMATICO',
    OTRO = 'OTRO'
  }
  
// Actualizar el tipo Recibo existente:
export type Recibo = {
  alumnoSuelto: any;
  id: number;
  numeroRecibo: number;
  fecha: Date;
  fechaEfecto: Date;
  monto: number;
  montoOriginal: number;
  descuento?: number;
  periodoPago: string;
  tipoPago: TipoPago;
  fueraDeTermino: boolean;
  esClaseSuelta: boolean;
  esMesCompleto: boolean;
  alumno: Alumno;
  alumnoId: number;
  concepto: Concepto;
  conceptoId: number;
  pagosDeuda: PagoDeuda[];
  anulado: boolean;
  motivoAnulacion?: string;
  createdAt: Date;
  updatedAt: Date;
};

  // Agregar a tu archivo de types:

export type DescuentoAplicado = {
  id: number;
  descuento: Descuento;
  descuentoId: number;
  alumno: Alumno;
  alumnoId: number;
  fechaInicio: Date;
  fechaFin?: Date;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Descuento = {
  id: number;
  nombre: string;
  porcentaje: number;
  activo: boolean;
  esAutomatico: boolean;
  minEstilos?: number;
  aplicadoA: DescuentoAplicado[];
  createdAt: Date;
  updatedAt: Date;
};



export type PagoDeuda = {
  id: number;
  deuda: Deuda;
  deudaId: number;
  recibo: Recibo;
  reciboId: number;
  monto: number;
  fecha: Date;
  createdAt: Date;
  updatedAt: Date;
};


  
  export type Profesor = {
    cuit: ReactNode;
    porcentajeClasesSueltasPorDefecto: ReactNode;
    porcentajePorDefecto: ReactNode;
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string | null;
    telefono: string | null;
    fechaIngreso: Date;
    estilos: Estilo[];
    clases: Clase[];
    liquidaciones: Liquidacion[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type CtaCte = {
    id: number;
    saldo: number;
    alumno: Alumno;
    alumnoId: number;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Liquidacion = {
    id: number;
    fecha: Date;
    monto: number;
    profesor: Profesor;
    profesorId: number;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type CajaDiaria = {
    id: number;
    fecha: Date;
    apertura: number;
    cierre: number;
    diferencia: number;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Clase = {
    id: number;
    fecha: Date;
    profesorId: number;
    profesor: Profesor;
    estiloId: number;
    estilo: Estilo;
    asistencias: Asistencia[];
    alumnosSueltos: AlumnoSuelto[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Asistencia = {
    id: number;
    claseId: number;
    clase: Clase;
    alumnoId: number;
    alumno: Alumno;
    asistio: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type AlumnoSuelto = {
    id: number;
    claseId: number;
    clase: Clase;
    nombre: string;
    apellido: string;
    telefono: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

