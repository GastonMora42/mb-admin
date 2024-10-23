

// components/Liquidaciones.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Interfaces
interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  monto: number;
  tipoPago: string;
  alumno: Alumno | null; // asegúrate de que puede ser null
  concepto: {
    nombre: string;
  };
}

interface Alumno {
  nombre: string;
  apellido: string;
}

interface Concepto {
  id: number;
  nombre: string;
}


interface FiltrosLiquidacion {
  profesorId?: number;
  alumnoId?: number;
  periodo: string; // formato "YYYY-MM"
}

interface LiquidacionData {
  regularCount: number;
  sueltasCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: Recibo[];
}

const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  background-color: #f9f9f9;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #FFC001;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #f9f9f9;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #FFC001;
  }
`;

const MultiSelect = styled(Select)`
  height: 120px;
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 16px;
  font-weight: bold;
  grid-column: 1 / -1;
  width: 100%;

  &:hover {
    background-color: #e6ac00;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;


const Th = styled.th`
  background-color: #000000;
  color: #FFFFFF;
  text-align: left;
  padding: 12px;
`;

const Td = styled.td`
  border-bottom: 1px solid #F9F8F8;
  padding: 12px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #F9F8F8;
  }
`;

const TotalContainer = styled.div`
  margin-top: 20px;
  text-align: right;
  font-size: 18px;
  font-weight: bold;
`;

const ExportButton = styled(Button)`
  margin-top: 20px;
`;

const ResumenContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const ResumenGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
`;

const ResumenItem = styled.div`
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  div {
    margin: 5px 0;
    font-size: 14px;
  }
`;

const TotalGeneral = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #ddd;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Interfaces
interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  monto: number;
  tipoPago: string;
  alumno: Alumno | null;
  concepto: {
    nombre: string;
  };
}

interface Alumno {
  id: number;  // Añadido id
  nombre: string;
  apellido: string;
}

interface Concepto {
  id: number;
  nombre: string;
}

interface FiltrosLiquidacion {
  profesorId?: number;
  alumnoId?: number;
  periodo: string;
}

interface LiquidacionData {
  regularCount: number;
  sueltasCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: Recibo[];
}


// EditableAmount Component
const EditableAmount: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toFixed(2));

  const handleBlur = () => {
    const newValue = parseFloat(tempValue);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        step="0.01"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        autoFocus
        style={{ width: '100px' }}
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
      ${value.toFixed(2)}
    </span>
  );
};

// Main Component
const Liquidaciones: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [editableRecibos, setEditableRecibos] = useState<{[key: number]: number}>({});
  const [filtros, setFiltros] = useState<FiltrosLiquidacion>({
    profesorId: undefined,
    alumnoId: undefined,
    periodo: new Date().toISOString().slice(0, 7) // Formato YYYY-MM
  });
  const [liquidacionData, setLiquidacionData] = useState<LiquidacionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchProfesores();
    fetchAlumnos();
  }, []);

  const fetchProfesores = async () => {
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) throw new Error('Error al cargar profesores');
      const data = await res.json();
      setProfesores(data);
    } catch (error) {
      setError('Error al cargar los profesores');
      console.error('Error fetching profesores:', error);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const res = await fetch('/api/alumnos');
      if (!res.ok) throw new Error('Error al cargar alumnos');
      const data = await res.json();
      setAlumnos(data);
    } catch (error) {
      setError('Error al cargar los alumnos');
      console.error('Error fetching alumnos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtros.periodo) {
      setError('Por favor seleccione un período');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/liquidaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros),
      });

      if (!res.ok) {
        throw new Error('Error al generar la liquidación');
      }

      const data = await res.json();
      setLiquidacionData(data);
      // Reiniciar los montos editables cuando se carga nueva data
      setEditableRecibos({});
    } catch (error) {
      setError('Error al generar la liquidación');
      console.error('Error generando liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!liquidacionData) return;

    const totalRegularEditado = liquidacionData.recibos
      .filter(r => r.concepto.nombre !== 'Clase Suelta')
      .reduce((sum, r) => sum + (editableRecibos[r.id] ?? (r.monto * 0.6)), 0);

    const totalSueltasEditado = liquidacionData.recibos
      .filter(r => r.concepto.nombre === 'Clase Suelta')
      .reduce((sum, r) => sum + (editableRecibos[r.id] ?? (r.monto * 0.8)), 0);

    const profesor = filtros.profesorId 
      ? profesores.find(p => p.id === filtros.profesorId)
      : null;

    const wsData = [
      ['LIQUIDACIÓN DE PROFESORES'],
      [`Período: ${filtros.periodo}`],
      profesor ? [`Profesor: ${profesor.apellido}, ${profesor.nombre}`] : ['Todos los profesores'],
      [''],
      ['RESUMEN'],
      ['Cursos Regulares'],
      ['Cantidad de alumnos:', liquidacionData.regularCount],
      ['Total a liquidar:', `$${totalRegularEditado.toFixed(2)}`],
      [''],
      ['Clases Sueltas'],
      ['Cantidad de alumnos:', liquidacionData.sueltasCount],
      ['Total a liquidar:', `$${totalSueltasEditado.toFixed(2)}`],
      [''],
      ['TOTAL A LIQUIDAR:', `$${(totalRegularEditado + totalSueltasEditado).toFixed(2)}`],
      [''],
      ['DETALLE DE RECIBOS'],
      ['N° Recibo', 'Fecha', 'Alumno', 'Concepto', 'Tipo de Pago', 'Monto Original', 'Monto a Liquidar'],
      ...liquidacionData.recibos.map(recibo => [
        recibo.numeroRecibo,
        new Date(recibo.fecha).toLocaleDateString(),
        recibo.alumno ? `${recibo.alumno.apellido}, ${recibo.alumno.nombre}` : 'Sin alumno',
        recibo.concepto.nombre,
        recibo.tipoPago,
        `$${recibo.monto.toFixed(2)}`,
        `$${(editableRecibos[recibo.id] ?? (recibo.monto * (recibo.concepto.nombre === 'Clase Suelta' ? 0.8 : 0.6))).toFixed(2)}`
      ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const wscols = [
      { wch: 15 }, // N° Recibo
      { wch: 15 }, // Fecha
      { wch: 30 }, // Alumno
      { wch: 20 }, // Concepto
      { wch: 15 }, // Tipo de Pago
      { wch: 15 }, // Monto Original
      { wch: 15 }  // Monto a Liquidar
    ];

    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Liquidación');

    const excelBuffer = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array' 
    });

    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(data, `Liquidacion_${filtros.periodo}${profesor ? `_${profesor.apellido}` : ''}.xlsx`);
  };

  return (
    <Container>
      <Title>Generación de Liquidaciones</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="periodo">Período</Label>
          <Input
            type="month"
            id="periodo"
            required
            value={filtros.periodo}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              periodo: e.target.value
            }))}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="profesor">Profesor (Opcional)</Label>
          <Select 
            id="profesor" 
            value={filtros.profesorId || ''}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              profesorId: e.target.value ? Number(e.target.value) : undefined
            }))}
          >
            <option value="">Todos los profesores</option>
            {profesores.map(profesor => (
              <option key={profesor.id} value={profesor.id}>
                {`${profesor.apellido}, ${profesor.nombre}`}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="alumno">Alumno (Opcional)</Label>
          <Select 
            id="alumno" 
            value={filtros.alumnoId || ''}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              alumnoId: e.target.value ? Number(e.target.value) : undefined
            }))}
          >
            <option value="">Todos los alumnos</option>
            {alumnos.map(alumno => (
              <option key={alumno.id} value={alumno.id}>
                {`${alumno.apellido}, ${alumno.nombre}`}
              </option>
            ))}
          </Select>
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              Generando...
            </>
          ) : 'Generar Liquidación'}
        </Button>
      </Form>

      {liquidacionData && (
        <>
          <ResumenContainer>
            <h3>Resumen de Liquidación</h3>
            <ResumenGrid>
              <ResumenItem>
                <h4>Cursos Regulares</h4>
                <div>Cantidad de alumnos: {liquidacionData.regularCount}</div>
                <div>Total recaudado: ${liquidacionData.totalRegular.toFixed(2)}</div>
                <div>Porcentaje profesor: 60%</div>
                <div>Monto liquidación: ${liquidacionData.montoLiquidacionRegular.toFixed(2)}</div>
              </ResumenItem>
              <ResumenItem>
                <h4>Clases Sueltas</h4>
                <div>Cantidad de alumnos: {liquidacionData.sueltasCount}</div>
                <div>Total recaudado: ${liquidacionData.totalSueltas.toFixed(2)}</div>
                <div>Porcentaje profesor: 80%</div>
                <div>Monto liquidación: ${liquidacionData.montoLiquidacionSueltas.toFixed(2)}</div>
              </ResumenItem>
            </ResumenGrid>
            <TotalGeneral>
              Total a Liquidar: ${(liquidacionData.montoLiquidacionRegular + liquidacionData.montoLiquidacionSueltas).toFixed(2)}
            </TotalGeneral>
          </ResumenContainer>

          <Table>
            <thead>
              <tr>
                <Th>N° Recibo</Th>
                <Th>Fecha</Th>
                <Th>Alumno</Th>
                <Th>Concepto</Th>
                <Th>Tipo de Pago</Th>
                <Th>Monto Original</Th>
                <Th>Monto a Liquidar</Th>
              </tr>
            </thead>
            <tbody>
              {liquidacionData.recibos.map((recibo) => {
                const porcentaje = recibo.concepto.nombre === 'Clase Suelta' ? 0.8 : 0.6;
                const montoLiquidacion = editableRecibos[recibo.id] ?? (recibo.monto * porcentaje);
                
                return (
                  <tr key={recibo.id}>
                    <Td>{recibo.numeroRecibo}</Td>
                    <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                    <Td>
                      {recibo.alumno ? `${recibo.alumno.apellido}, ${recibo.alumno.nombre}` : 'Sin alumno'}
                    </Td>
                    <Td>{recibo.concepto.nombre}</Td>
                    <Td>{recibo.tipoPago}</Td>
                    <Td>${recibo.monto.toFixed(2)}</Td>
                    <Td>
                      <EditableAmount
                        value={montoLiquidacion}
                        onChange={(newValue) => {
                          setEditableRecibos(prev => ({
                            ...prev,
                            [recibo.id]: newValue
                          }));
                        }}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <ExportButton onClick={exportToExcel}>
            Exportar a Excel
          </ExportButton>
        </>
      )}
    </Container>
  );
};

export default Liquidaciones;