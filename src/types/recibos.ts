import { Alumno, AlumnoSuelto, Concepto, Deuda, Prisma, TipoPago } from "@prisma/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// types.ts
export interface DeudaSeleccionada {
    deudaId: number;
    monto: number;
    montoOriginal: number;
    estilo: string;
    periodo: string;
  }
  
  export interface NuevoRecibo {
    monto: string;
    periodoPago: string;
    tipoPago: TipoPago;
    alumnoId: string;
    alumnoSueltoId: string;
    conceptoId: string;
    fueraDeTermino: boolean;
    esClaseSuelta: boolean;
    esMesCompleto: boolean;
    fecha: string;
    fechaEfecto: string;
    descuentoManual: number;
    deudasAPagar?: DeudaSeleccionada[];
  }
  
  export interface ReciboPendiente {
    id: string;
    alumno?: Alumno;
    alumnoSuelto?: AlumnoSuelto;
    monto: number;
    fecha: string;
    fechaEfecto: string;
    periodoPago: string;
    concepto: Concepto;
    tipoPago: TipoPago;
    descuento?: number;
    deudasSeleccionadas: {[key: number]: DeudaSeleccionada};
  }
  
  export interface VistaPrevia {
    subtotal: number;
    descuentos: number;
    total: number;
    deudasAPagar: {
      id: number;
      concepto: string;
      monto: number;
      periodo: string;
    }[];
  }
  
  // Hooks personalizados
  export const useReciboState = () => {
    const [nuevoRecibo, setNuevoRecibo] = useState<NuevoRecibo>({
      monto: '',
      periodoPago: format(new Date(), 'yyyy-MM'),
      tipoPago: TipoPago.EFECTIVO,
      alumnoId: '',
      alumnoSueltoId: '',
      conceptoId: '',
      fueraDeTermino: false,
      esClaseSuelta: false,
      esMesCompleto: false,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      fechaEfecto: format(new Date(), 'yyyy-MM-dd'),
      descuentoManual: 0,
    });
  
    const [deudasSeleccionadas, setDeudasSeleccionadas] = useState<{[key: number]: DeudaSeleccionada}>({});
  
    return {
      nuevoRecibo,
      setNuevoRecibo,
      deudasSeleccionadas,
      setDeudasSeleccionadas
    };
  };
  
  export const useDeudas = (alumnoId: string) => {
    const [deudasAlumno, setDeudasAlumno] = useState<Deuda[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (!alumnoId) {
        setDeudasAlumno([]);
        return;
      }
  
      const fetchDeudas = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/deudas?alumnoId=${alumnoId}&pagada=false`);
          if (!res.ok) throw new Error('Error al obtener deudas');
          const deudas = await res.json();
          setDeudasAlumno(deudas);
          setError(null);
        } catch (error) {
          console.error('Error al cargar deudas:', error);
          setError('Error al cargar las deudas');
        } finally {
          setLoading(false);
        }
      };
  
      fetchDeudas();
    }, [alumnoId]);
  
    return { deudasAlumno, loading, error };
  };

  export type ReciboWithRelations = Prisma.ReciboGetPayload<{
    include: {
      alumno: true;
      alumnoSuelto: true;
      concepto: true;
      pagosDeuda: {
        include: {
          deuda: {
            include: {
              estilo: true;
            }
          }
        }
      }
    }
  }>;