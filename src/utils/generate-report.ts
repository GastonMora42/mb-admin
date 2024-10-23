import prisma from '@/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

export async function generateDailyReport(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

// Obtener la caja diaria específica para la fecha del reporte
const cajaDiaria = await prisma.cajaDiaria.findFirst({
    where: {
      fecha: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Obtener los recibos generados en el día del reporte
  const recibos = await prisma.recibo.findMany({
    where: {
      fecha: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      alumno: true,
      alumnoSuelto: true,  // Añadimos esto
      concepto: true,
    },
  });

  // Calcular totales por medio de pago
  const totalesPorMedioPago = recibos.reduce((acc, r) => {
    acc[r.tipoPago] = (acc[r.tipoPago] || 0) + r.monto;
    return acc;
  }, {} as Record<string, number>);

  const totalRecaudado = Object.values(totalesPorMedioPago).reduce((sum, val) => sum + val, 0);


  // Obtener alumnos sueltos creados el mismo día de la última caja
  const alumnosSueltosNuevos = await prisma.alumnoSuelto.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Obtener clases del día
  const clases = await prisma.clase.findMany({
    where: {
      fecha: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      profesor: true,
      estilo: true,
      asistencias: {
        include: {
          alumno: true,
        },
      },
      alumnosSueltos: true,
    },
  });

  // Generar el HTML del reporte
  let reportHtml = `
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
      .caja-diaria { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .recibos { background-color: #f9e79f; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .totales { background-color: #d5f5e3; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .alumnos-sueltos { background-color: #e8f6f3; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .clases { background-color: #eaf2f8; padding: 15px; border-radius: 5px; }
    </style>
  </head>
  <body>
    <h1>Reporte Diario de MB: ${date.toLocaleDateString()}</h1>
    
    <div class="caja-diaria">
      <h2>Caja Diaria</h2>
      ${cajaDiaria ? `
        <table>
          <tr><th>Fecha</th><td>${cajaDiaria.fecha.toLocaleDateString()}</td></tr>
          <tr><th>Apertura</th><td>$${cajaDiaria.apertura.toFixed(2)}</td></tr>
          <tr><th>Cierre</th><td>$${cajaDiaria.cierre.toFixed(2)}</td></tr>
          <tr><th>Diferencia</th><td>$${cajaDiaria.diferencia.toFixed(2)}</td></tr>
        </table>
      ` : '<p>No hay datos de caja diaria disponibles para este día.</p>'}
    </div>

    <div class="recibos">
      <h2>Recibos Generados</h2>
      ${recibos.length > 0 ? `
        <table>
          <tr>
            <th>Número</th>
            <th>Alumno</th>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Tipo de Pago</th>
          </tr>
          ${recibos.map(r => `
  <tr>
    <td>${r.numeroRecibo}</td>
    <td>${r.alumno ? `${r.alumno.nombre} ${r.alumno.apellido}` : 'Sin alumno'}</td>
    <td>${r.concepto.nombre}</td>
    <td>$${r.monto.toFixed(2)}</td>
    <td>${r.tipoPago}</td>
  </tr>
`).join('')}
        </table>
      ` : '<p>No se generaron recibos en este día.</p>'}
    </div>

    <div class="totales">
      <h2>Totales Recaudados</h2>
      <table>
        ${Object.entries(totalesPorMedioPago).map(([tipoPago, total]) => `
          <tr>
            <th>${tipoPago}</th>
            <td>$${total.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr>
          <th>Total General</th>
          <td>$${totalRecaudado.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
      <div class="alumnos-sueltos">
        <h2>Nuevos Alumnos Sueltos</h2>
        ${alumnosSueltosNuevos.length > 0 ? `
          <table>
            <tr><th>Nombre</th><th>Apellido</th><th>Teléfono</th><th>Email</th></tr>
            ${alumnosSueltosNuevos.map(a => `
              <tr>
                <td>${a.nombre}</td>
                <td>${a.apellido}</td>
                <td>${a.telefono || 'N/A'}</td>
                <td>${a.email || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        ` : '<p>No se registraron nuevos alumnos sueltos en este día.</p>'}
      </div>

      <div class="clases">
        <h2>Clases del Día</h2>
        ${clases.map(clase => `
          <h3>Clase de ${clase.estilo.nombre}</h3>
          <p>Profesor: ${clase.profesor.nombre} ${clase.profesor.apellido}</p>
          <p>Fecha: ${new Date(clase.fecha).toLocaleString()}</p>
          <h4>Asistencias:</h4>
          <table>
            <tr><th>Alumno</th><th>Asistencia</th></tr>
            ${clase.asistencias.map(a => `
              <tr>
                <td>${a.alumno.nombre} ${a.alumno.apellido}</td>
                <td>${a.asistio ? 'Asistió' : 'No asistió'}</td>
              </tr>
            `).join('')}
          </table>
          <h4>Alumnos Sueltos:</h4>
          <ul>
            ${clase.alumnosSueltos.map(a => `<li>${a.nombre} ${a.apellido}</li>`).join('')}
          </ul>
        `).join('')}
      </div>
    </body>
    </html>
  `;

  return reportHtml;
}