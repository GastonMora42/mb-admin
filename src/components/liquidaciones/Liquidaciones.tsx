import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

interface Concepto {
  id: number;
  nombre: string;
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  alumno: { nombre: string; apellido: string };
  concepto: { nombre: string };
  monto: number;
  tipoPago: string;
}

const Liquidaciones: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [año, setAño] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState<string[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [totalRegular, setTotalRegular] = useState(0);
  const [totalSuelto, setTotalSuelto] = useState(0);

  useEffect(() => {
    fetchConceptos();
  }, []);

  const fetchConceptos = async () => {
    try {
      const res = await fetch('/api/liquidaciones');
      if (res.ok) {
        const data = await res.json();
        setConceptos(data);
      }
    } catch (error) {
      console.error('Error fetching conceptos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/liquidaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ año, periodo, conceptosIds: conceptosSeleccionados.map(Number) }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecibos(data);
        calcularTotales(data);
      }
    } catch (error) {
      console.error('Error fetching recibos:', error);
    }
  };

  const calcularTotales = (recibos: Recibo[]) => {
    const totalReg = recibos.filter(r => r.concepto.nombre !== 'Clase Suelta').reduce((sum, r) => sum + r.monto, 0);
    const totalSue = recibos.filter(r => r.concepto.nombre === 'Clase Suelta').reduce((sum, r) => sum + r.monto, 0);
    setTotalRegular(totalReg);
    setTotalSuelto(totalSue);
  };

  const exportToExcel = () => {
    const wsData = recibos.map(recibo => ({
      'N° Recibo': recibo.numeroRecibo,
      'Fecha': new Date(recibo.fecha).toLocaleDateString(),
      'Alumno': `${recibo.alumno.nombre} ${recibo.alumno.apellido}`,
      'Concepto': recibo.concepto.nombre,
      'Tipo de Pago': recibo.tipoPago,
      'Importe': recibo.monto
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Liquidaciones");

    // Agregar filas con los totales
    XLSX.utils.sheet_add_aoa(ws, [
      ["Total Regular", "", "", "", "", totalRegular],
      ["Total Clases Sueltas", "", "", "", "", totalSuelto],
      ["Total General", "", "", "", "", totalRegular + totalSuelto]
    ], { origin: -1 });

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Liquidaciones_${año}_${periodo}.xlsx`);
  };

  return (
    <Container>
      <Title>Generación de Liquidaciones</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="año">Año</Label>
          <Select id="año" value={año} onChange={(e) => setAño(e.target.value)} required>
            <option value="">Seleccione año</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="periodo">Período</Label>
          <Select id="periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required>
            <option value="">Seleccione período</option>
            {[
              { value: '01', label: 'Enero' },
              { value: '02', label: 'Febrero' },
              { value: '03', label: 'Marzo' },
              { value: '04', label: 'Abril' },
              { value: '05', label: 'Mayo' },
              { value: '06', label: 'Junio' },
              { value: '07', label: 'Julio' },
              { value: '08', label: 'Agosto' },
              { value: '09', label: 'Septiembre' },
              { value: '10', label: 'Octubre' },
              { value: '11', label: 'Noviembre' },
              { value: '12', label: 'Diciembre' }
            ].map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup style={{ gridColumn: '1 / -1' }}>
          <Label htmlFor="conceptos">Conceptos (mantén Ctrl para selección múltiple)</Label>
          <MultiSelect 
            id="conceptos"
            multiple 
            value={conceptosSeleccionados}
            onChange={(e) => setConceptosSeleccionados(Array.from(e.target.selectedOptions, option => option.value))}
            required
          >
            {conceptos.map(concepto => (
              <option key={concepto.id} value={concepto.id}>{concepto.nombre}</option>
            ))}
          </MultiSelect>
        </FormGroup>
        <Button type="submit">Generar Liquidación</Button>
      </Form>

      {recibos.length > 0 && (
        <>
          <Table>
            <thead>
              <Tr>
                <Th>N° Recibo</Th>
                <Th>Fecha</Th>
                <Th>Alumno</Th>
                <Th>Concepto</Th>
                <Th>Tipo de Pago</Th>
                <Th>Importe</Th>
              </Tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <Tr key={recibo.id}>
                  <Td>{recibo.numeroRecibo}</Td>
                  <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                  <Td>{`${recibo.alumno.nombre} ${recibo.alumno.apellido}`}</Td>
                  <Td>{recibo.concepto.nombre}</Td>
                  <Td>{recibo.tipoPago}</Td>
                  <Td>${recibo.monto.toFixed(2)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <TotalContainer>
            Total Regular: ${totalRegular.toFixed(2)}
            <br />
            Total Clases Sueltas: ${totalSuelto.toFixed(2)}
            <br />
            Total General: ${(totalRegular + totalSuelto).toFixed(2)}
          </TotalContainer>
          <ExportButton onClick={exportToExcel}>Exportar a Excel</ExportButton>
        </>
      )}
    </Container>
  );
};

export default Liquidaciones;