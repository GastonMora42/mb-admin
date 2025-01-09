import { DeudaSeleccionada, NuevoRecibo } from "@/types/recibos";
import { Deuda, PagoDeuda } from "@prisma/client";
import { useState } from "react";

// utils/recibos.ts
export const calcularMontos = (
    montoBase: number,
    deudasSeleccionadas: {[key: number]: DeudaSeleccionada},
    descuentoManual: number
  ) => {
    const deudasTotal = Object.values(deudasSeleccionadas)
      .reduce((sum, deuda) => sum + deuda.monto, 0);
    
    const subtotal = montoBase + deudasTotal;
    const descuentoTotal = subtotal * (descuentoManual / 100);
    const total = subtotal - descuentoTotal;
  
    return { subtotal, descuentoTotal, total };
  };
  
  // services/recibos.ts
  export const crearRecibo = async (reciboData: any) => {
    const res = await fetch('/api/recibos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...reciboData,
        periodoPago: reciboData.periodoPago.replace('/', '-'), // Aseguramos formato correcto
      }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al crear recibo');
    }
  
    return res.json();
  };
  
  // hooks/useRecibos.ts
  // utils/recibos.ts

export const useRecibos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const procesarRecibo = async (
      nuevoRecibo: NuevoRecibo,
      deudasSeleccionadas: {[key: number]: DeudaSeleccionada}
    ) => {
      setLoading(true);
      try {
        const { subtotal, total } = calcularMontos(
          parseFloat(nuevoRecibo.monto),
          deudasSeleccionadas,
          nuevoRecibo.descuentoManual
        );
  
        const reciboData = {
          ...nuevoRecibo,
          monto: total,
          montoOriginal: subtotal,
          descuento: nuevoRecibo.descuentoManual > 0 ? nuevoRecibo.descuentoManual / 100 : null,
          deudasAPagar: Object.entries(deudasSeleccionadas).map(([deudaId, deuda]) => ({
            deudaId: parseInt(deudaId),
            monto: deuda.monto,
            periodo: deuda.periodo
          }))
        };
  
        const reciboCreado = await crearRecibo(reciboData);
        
        // Verificar que las deudas se saldaron correctamente
        if (nuevoRecibo.alumnoId) {
          const deudasActualizadas = await fetch(
            `/api/deudas?alumnoId=${nuevoRecibo.alumnoId}&pagada=false`
          ).then(res => res.json());
  
          // Corrección aquí: Usamos Object.keys(deudasSeleccionadas) en lugar de deudaId
          const deudasNoSaldadas = deudasActualizadas.filter(
            (deuda: Deuda) => Object.keys(deudasSeleccionadas).includes(deuda.id.toString()) && !deuda.pagada
          );
  
          if (deudasNoSaldadas.length > 0) {
            console.error('Deudas no saldadas:', deudasNoSaldadas);
            throw new Error('Algunas deudas no se saldaron correctamente');
          }
        }
  
        return reciboCreado;
      } catch (error) {
        console.error('Error en procesarRecibo:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
    const anularRecibo = async (id: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recibos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anulado: true }),
        });
  
        if (!res.ok) {
          throw new Error('Error al anular el recibo');
        }
  
        const reciboAnulado = await res.json();
        
        // Verificar que las deudas se reactivaron
        if (reciboAnulado.alumnoId && reciboAnulado.pagosDeuda?.length > 0) {
          const deudasVerificacion = await fetch(
            `/api/deudas?alumnoId=${reciboAnulado.alumnoId}`
          ).then(res => res.json());
  
          // Verificamos las deudas que deberían estar reactivadas
          const deudasNoReactivadas = reciboAnulado.pagosDeuda.filter(
            (pago: PagoDeuda) => {
              const deudaCorrespondiente = deudasVerificacion.find(
                (deuda: Deuda) => deuda.id === pago.deudaId
              );
              return !deudaCorrespondiente || deudaCorrespondiente.pagada;
            }
          );
  
          if (deudasNoReactivadas.length > 0) {
            console.error('Deudas no reactivadas:', deudasNoReactivadas);
            throw new Error('Algunas deudas no se reactivaron correctamente');
          }
        }
  
        return reciboAnulado;
      } catch (error) {
        console.error('Error en anularRecibo:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
    return {
      loading,
      error,
      procesarRecibo,
      anularRecibo
    };
  };