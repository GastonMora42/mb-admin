//src/types/alumno-estilos.ts

import { ReactNode } from "react";
import { TipoModalidad } from "@prisma/client";

export type Alumno = {
    tipoAlumno: string;
    descuentosVigentes: DescuentoAplicado[];
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
    // Propiedades calculadas (no existen en la BD pero se usan en el frontend)
    inscripcionPagada?: boolean;
    fechaPagoInscripcion?: Date | null;
};

export type Estilo = {
    importe: number;
    id: number;
    nombre: string;
    descripcion: string | null;
    profesorId: number | null;
    profesor: Profesor | null;
    alumnoEstilos: AlumnoEstilo[];
    deudas: Deuda[];
    conceptos: Concepto[];
    clases: Clase[];
    modalidades: ModalidadClase[]; // Nueva propiedad
    createdAt: Date;
    updatedAt: Date;
};

export type ModalidadClase = {
    id: number;
    tipo: TipoModalidad;
    porcentaje: number;
    estiloId: number;
    estilo: Estilo;
    alumnoEstilos: AlumnoEstilo[];
    clases: Clase[];
};

export type AlumnoEstilo = {
    alumno: Alumno;
    alumnoId: number;
    estilo: Estilo;
    estiloId: number;
    modalidad: ModalidadClase; // Nueva propiedad
    modalidadId: number; // Nueva propiedad
    activo: boolean;
    fechaInicio: Date;
    fechaFin?: Date;
};

export type Deuda = {
    montoOriginal: number;
    estiloNombre: any;
    id: number;
    alumno: Alumno;
    alumnoId: number;
    monto: number;
    mes: string;
    anio: number;
    estilo: Estilo;
    estiloId: number;
    pagada: boolean;
    tipoDeuda: TipoModalidad; // Nuevo en lugar de esInscripcion
    cantidadClases?: number; // Nuevo para modalidad SUELTA
    concepto?: Concepto | null;
    conceptoId?: number | null;
    fechaVencimiento: Date;
    pagos: PagoDeuda[];
    createdAt: Date;
    updatedAt: Date;
    // Propiedades calculadas
    montoPagado?: number;
    saldoPendiente?: number;
    pagosDetalle?: any[];
};

export type Concepto = {
    id: number;
    nombre: string;
    descripcion: string | null;
    montoRegular: number; // Cambió de monto a montoRegular
    montoSuelto: number; // Nuevo
    esInscripcion: boolean;
    estiloId: number | null;
    estilo: Estilo | null;
    recibos: Recibo[];
    deudas: Deuda[];
    inscripciones: Inscripcion[];
    createdAt: Date;
    updatedAt: Date;
};

export type Inscripcion = {
    id: number;
    alumnoId: number;
    alumno: Alumno;
    monto: number;
    pagada: boolean;
    fechaPago?: Date;
    conceptoId: number; // Nuevo
    concepto: Concepto; // Nuevo
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

export type Recibo = {
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
    alumno?: Alumno | null;
    alumnoId?: number | null;
    alumnoSuelto?: AlumnoSuelto | null;
    alumnoSueltoId?: number | null;
    concepto: Concepto;
    conceptoId: number;
    clase?: Clase | null;
    claseId?: number | null;
    pagosDeuda: PagoDeuda[];
    anulado: boolean;
    motivoAnulacion?: string;
    createdAt: Date;
    updatedAt: Date;
};

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
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string | null;
    telefono: string | null;
    fechaIngreso: Date;
    cuit: string | null;
    direccion: string | null;
    fechaNacimiento: Date | null;
    porcentajePorDefecto: number;
    porcentajeClasesSueltasPorDefecto: number;
    activo: boolean;
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
    profesorId: number | null;
    profesor: Profesor | null;
    mes: number;
    anio: number;
    montoTotalRegular: number; // Nuevo
    montoTotalSueltas: number; // Nuevo
    porcentajeRegular: number; // Nuevo
    porcentajeSueltas: number; // Nuevo
    totalLiquidar: number; // Nuevo
    estado: string;
    detalles: DetalleLiquidacion[];
};

export type DetalleLiquidacion = {
    id: number;
    liquidacionId: number;
    liquidacion: Liquidacion;
    reciboId: number | null;
    recibo: Recibo | null;
    montoOriginal: number;
    porcentaje: number;
    montoLiquidado: number;
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
    modalidadId: number; // Nuevo
    modalidad: ModalidadClase; // Nuevo
    asistencias: Asistencia[];
    alumnosSueltos: AlumnoSuelto[];
    recibos: Recibo[];
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
    nombre: string;
    apellido: string;
    telefono: string | null;
    email: string | null;
    dni: string;
    alumnoRegularId: number | null;
    alumnoRegular: Alumno | null;
    recibos: Recibo[];
    clases: Clase[]; // Relación a clases, no una clase específica
    createdAt: Date;
    updatedAt: Date;
};