import prisma from '@/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

export async function generateMonthlyReport(year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  // Obtener todas las cajas diarias del mes
  const cajasDiarias = await prisma.cajaDiaria.findMany({
    where: {
      fecha: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: {
      fecha: 'asc',
    },
  });

  // Obtener todos los recibos del mes
  const recibos = await prisma.recibo.findMany({
    where: {
      fecha: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      alumno: true,
      concepto: true,
    },
  });

  // Calcular totales por medio de pago
  const totalesPorMedioPago = recibos.reduce((acc, r) => {
    acc[r.tipoPago] = (acc[r.tipoPago] || 0) + r.monto;
    return acc;
  }, {} as Record<string, number>);

  const totalRecaudado = Object.values(totalesPorMedioPago).reduce((sum, val) => sum + val, 0);

  // Obtener nuevos alumnos del mes
  const nuevosAlumnos = await prisma.alumno.findMany({
    where: {
      fechaIngreso: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Obtener clases del mes
  const clases = await prisma.clase.findMany({
    where: {
      fecha: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      profesor: true,
      estilo: true,
    },
  });

  // Calcular estadísticas de clases
  const clasesStats = clases.reduce((acc, clase) => {
    acc.totalClases++;
    acc.porEstilo[clase.estilo.nombre] = (acc.porEstilo[clase.estilo.nombre] || 0) + 1;
    acc.porProfesor[`${clase.profesor.nombre} ${clase.profesor.apellido}`] = 
      (acc.porProfesor[`${clase.profesor.nombre} ${clase.profesor.apellido}`] || 0) + 1;
    return acc;
  }, { totalClases: 0, porEstilo: {}, porProfesor: {} } as { totalClases: number, porEstilo: Record<string, number>, porProfesor: Record<string, number> });

  // Generar el HTML del reporte
  const reportHtml = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #2980b9; }
        h3 { color: #16a085; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .section { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Reporte Mensual de MB: ${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
      
      <div class="section">
        <h2>Resumen Financiero</h2>
        <table>
          <tr>
            <th>Total Recaudado</th>
            <td>$${totalRecaudado.toFixed(2)}</td>
          </tr>
          ${Object.entries(totalesPorMedioPago).map(([tipoPago, total]) => `
            <tr>
              <th>${tipoPago}</th>
              <td>$${total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Estadísticas de Cajas Diarias</h2>
        <p>Total de días con registro: ${cajasDiarias.length}</p>
        <p>Promedio de apertura: $${(cajasDiarias.reduce((sum, caja) => sum + caja.apertura, 0) / cajasDiarias.length).toFixed(2)}</p>
        <p>Promedio de cierre: $${(cajasDiarias.reduce((sum, caja) => sum + caja.cierre, 0) / cajasDiarias.length).toFixed(2)}</p>
      </div>

      <div class="section">
        <h2>Nuevos Alumnos</h2>
        <p>Total de nuevos alumnos: ${nuevosAlumnos.length}</p>
        <table>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha de Ingreso</th>
          </tr>
          ${nuevosAlumnos.map(alumno => `
            <tr>
              <td>${alumno.nombre}</td>
              <td>${alumno.apellido}</td>
              <td>${alumno.fechaIngreso.toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Estadísticas de Clases</h2>
        <p>Total de clases impartidas: ${clasesStats.totalClases}</p>
        <h3>Clases por Estilo</h3>
        <table>
          ${Object.entries(clasesStats.porEstilo).map(([estilo, cantidad]) => `
            <tr>
              <th>${estilo}</th>
              <td>${cantidad}</td>
            </tr>
          `).join('')}
        </table>
        <h3>Clases por Profesor</h3>
        <table>
          ${Object.entries(clasesStats.porProfesor).map(([profesor, cantidad]) => `
            <tr>
              <th>${profesor}</th>
              <td>${cantidad}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </body>
    </html>
  `;

  return reportHtml;
}