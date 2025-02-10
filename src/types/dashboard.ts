// types/dashboard.ts
export interface MediosPago {
  [key: string]: {
    monto: number;
    cantidad: number;
  };
}

export interface DashboardData {
  metricas: {
    alumnos: {
      activos: number;
      nuevos: number;
      inactivos: number;
      sueltos: number;
      bajas: number;  // Nueva línea agregada
      inscripciones: number; // Añadimos esta métrica
      tasaCrecimiento: string;
    };
    clases: {
      total: number;
      asistencias: number;
      tasaAsistencia: string;
    };
    finanzas: {
      ingresos: number;
      deudasMes: number;
      deudasTotales: number;
      tasaCobranza: string;
      mediosPago: MediosPago;
    };
  };
  rankings: {
    estilosPopulares: Array<{
      nombre: string;
      _count: {
        alumnoEstilos: number;
      };
    }>;
    profesores: Array<{
      nombre: string;
      apellido: string;
      _count: {
        clases: number;
      };
    }>;
    alumnosAsistencia: Array<{
      nombre: string;
      apellido: string;
      _count: {
        asistencias: number;
      };
    }>;
  };
  periodo: {
    mes: string;
    anio: number;
  };
  ultimaActualizacion: string;
}