import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useUserRole } from '@/hooks/useUserRole';

const Container = styled.div`
 background-color: #FFFFFF;
 padding: 30px;
 border-radius: 8px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
 color: #000000;
 margin-bottom: 20px;
`;

const Form = styled.form`
 display: flex;
 flex-direction: column;
 gap: 20px;
`;

const FormRow = styled.div`
 display: flex;
 gap: 15px;
 align-items: center;
`;

const InputGroup = styled.div`
 display: flex;
 align-items: center;
 gap: 10px;
`;

const Label = styled.label`
 min-width: 100px;
`;

const Input = styled.input`
 padding: 10px;
 border: 1px solid #ccc;
 border-radius: 4px;
 flex: 1;
`;

const Select = styled.select`
 padding: 10px;
 border: 1px solid #ccc;
 border-radius: 4px;
 flex: 1;
`;

const Button = styled.button`
 background-color: #FFC001;
 color: #000000;
 border: none;
 padding: 10px 20px;
 border-radius: 4px;
 cursor: pointer;
 transition: background-color 0.3s;

 &:hover {
   background-color: #e6ac00;
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

const Message = styled.div<{ isError?: boolean }>`
 margin-top: 20px;
 padding: 10px;
 border-radius: 4px;
 background-color: ${props => props.isError ? '#ffcccc' : '#ccffcc'};
 color: ${props => props.isError ? '#cc0000' : '#006600'};
`;

const TotalesContainer = styled.div`
 margin-top: 30px;
 background-color: #f0f0f0;
 border-radius: 8px;
 padding: 20px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TotalGeneral = styled.h3`
 font-size: 24px;
 color: #000000;
 margin-bottom: 20px;
 text-align: right;
`;

const TotalesPorTipo = styled.div`
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
 gap: 15px;
`;

const TotalTipo = styled.div`
 background-color: #ffffff;
 padding: 15px;
 border-radius: 6px;
 box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const TipoLabel = styled.p`
 font-weight: bold;
 margin-bottom: 5px;
`;

const TipoMonto = styled.p`
 font-size: 18px;
 color: #0066cc;
`;

const AutocompleteContainer = styled.div`
 position: relative;
 flex: 1;
`;

const SearchInput = styled(Input)`
 width: 100%;
`;

const SuggestionsList = styled.ul`
 position: absolute;
 top: 100%;
 left: 0;
 right: 0;
 max-height: 200px;
 overflow-y: auto;
 margin: 0;
 padding: 0;
 list-style: none;
 border: 1px solid #ddd;
 border-radius: 4px;
 background-color: white;
 box-shadow: 0 4px 6px rgba(0,0,0,0.1);
 z-index: 1000;
`;

const SuggestionItem = styled.li`
 padding: 10px 12px;
 cursor: pointer;
 border-bottom: 1px solid #eee;
 
 &:last-child {
   border-bottom: none;
 }
 
 &:hover {
   background-color: #f5f5f5;
 }
`;

interface Recibo {
 id: number;
 numeroRecibo: number;
 fecha: string;
 alumno?: { id: number; nombre: string; apellido: string };
 alumnoSuelto?: { id: number; nombre: string; apellido: string };
 concepto: { id: number; nombre: string };
 periodoPago: string;
 fueraDeTermino: boolean;
 monto: number;
 tipoPago: string;
}

interface CajaDiariaData {
 recibos: Recibo[];
 totalMonto: number;
 totalPorTipoPago: Record<string, number>;
}

const CajaDiaria = () => {
 const [cajaData, setCajaData] = useState<CajaDiariaData>({ recibos: [], totalMonto: 0, totalPorTipoPago: {} });
 const [fechaInicio, setFechaInicio] = useState('');
 const [fechaFin, setFechaFin] = useState('');
 const [filtros, setFiltros] = useState({
   numeroRecibo: '',
   alumnoId: '',
   conceptoId: '',
   periodoPago: '',
   fueraDeTermino: '',
   tipoPago: ''
 });
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
 const [alumnos, setAlumnos] = useState<{ id: number; nombre: string; apellido: string }[]>([]);
 const [conceptos, setConceptos] = useState<{ id: number; nombre: string }[]>([]);
 const [showAlumnoSuggestions, setShowAlumnoSuggestions] = useState(false);
 const [showConceptoSuggestions, setShowConceptoSuggestions] = useState(false);
 const [searchAlumno, setSearchAlumno] = useState('');
 const [searchConcepto, setSearchConcepto] = useState('');
 const [alumnosFiltrados, setAlumnosFiltrados] = useState<any[]>([]);
 const [conceptosFiltrados, setConceptosFiltrados] = useState<any[]>([]);
 const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);


 const userRole = useUserRole();

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     const target = event.target as HTMLElement;
     if (!target.closest('.autocomplete-container')) {
       setShowAlumnoSuggestions(false);
       setShowConceptoSuggestions(false);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => {
     document.removeEventListener('mousedown', handleClickOutside);
   };
 }, []);

 useEffect(() => {
  if (userRole === 'Dueño' || userRole === 'Secretaria') {
    // Actualización inicial
    fetchCajaDiaria();
    
    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(() => {
      fetchCajaDiaria();
    }, 30000);
    
    setAutoUpdateInterval(interval);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }
}, [userRole]); // Solo depende del userRole

 const filteredAlumnos = useMemo(() => {
   if (!searchAlumno) return [];
   const searchTermLower = searchAlumno.toLowerCase();
   return alumnos.filter(alumno => 
     `${alumno.apellido} ${alumno.nombre}`.toLowerCase().includes(searchTermLower)
   );
 }, [searchAlumno, alumnos]);

 const filteredConceptos = useMemo(() => {
   if (!searchConcepto) return [];
   const searchTermLower = searchConcepto.toLowerCase();
   return conceptos.filter(concepto => 
     concepto.nombre.toLowerCase().includes(searchTermLower)
   );
 }, [searchConcepto, conceptos]);

 const fetchAlumnos = async () => {
   try {
     const res = await fetch('/api/alumnos');
     if (res.ok) {
       const data = await res.json();
       setAlumnos(data);
     }
   } catch (error) {
     console.error('Error fetching alumnos:', error);
   }
 };

 const fetchConceptos = async () => {
   try {
     const res = await fetch('/api/conceptos');
     if (res.ok) {
       const data = await res.json();
       setConceptos(data);
     }
   } catch (error) {
     console.error('Error fetching conceptos:', error);
   }
 };

 const fetchCajaDiaria = async () => {
  if (userRole !== 'Dueño' && userRole !== 'Secretaria') return;
  
  setLoading(true);
  try {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = new URLSearchParams();

    // Si es Dueño y ha seleccionado fechas, usa esas fechas
    if (userRole === 'Dueño' && (fechaInicio || fechaFin)) {
      queryParams.append('fechaInicio', fechaInicio || today);
      queryParams.append('fechaFin', fechaFin || today);
    } else {
      // Para Secretaria o cuando el Dueño no ha seleccionado fechas
      queryParams.append('fechaInicio', today);
      queryParams.append('fechaFin', today);
    }

    // Agregar otros filtros solo si es Dueño
    if (userRole === 'Dueño') {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const res = await fetch(`/api/cajadiaria?${queryParams}`);
    if (!res.ok) throw new Error('Error al obtener recibos');
    
    const data = await res.json();
    setCajaData(data);
    
    setMessage({ 
      text: userRole === 'Dueño' && (fechaInicio || fechaFin) ? 
        "Este es el historial de caja en las fechas seleccionadas" : 
        "Esta es la caja del día corriente", 
      isError: false 
    });
  } catch (error) {
    console.error('Error fetching recibos:', error);
    setMessage({ text: 'Error al cargar recibos', isError: true });
  } finally {
    setLoading(false);
  }
};

 const renderAlumnoNombre = (recibo: Recibo) => {
   if (recibo.alumno) {
     return `${recibo.alumno.nombre} ${recibo.alumno.apellido}`;
   } else if (recibo.alumnoSuelto) {
     return `${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido} (Suelto)`;
   }
   return 'Desconocido';
 };

 const handleFiltroChange = (name: string, value: string) => {
   if (userRole === 'Dueño') {
     setFiltros(prev => ({ ...prev, [name]: value }));
   }
 };

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   if (userRole === 'Dueño' || userRole === 'Secretaria') {
     fetchCajaDiaria();
   }
 };

 useEffect(() => {
  if (userRole === 'Dueño' || userRole === 'Secretaria') {
    fetchCajaDiaria();
    fetchAlumnos();
    fetchConceptos();
  }
}, [userRole]);

 useEffect(() => {
  if (searchAlumno) {
    const filtered = alumnos.filter(alumno => 
      `${alumno.apellido} ${alumno.nombre}`.toLowerCase().includes(searchAlumno.toLowerCase())
    );
    setAlumnosFiltrados(filtered);
  } else {
    setAlumnosFiltrados([]);
  }
}, [searchAlumno, alumnos]);

useEffect(() => {
  if (searchConcepto) {
    const filtered = conceptos.filter(concepto => 
      concepto.nombre.toLowerCase().includes(searchConcepto.toLowerCase())
    );
    setConceptosFiltrados(filtered);
  } else {
    setConceptosFiltrados([]);
  }
}, [searchConcepto, conceptos]);

 if (userRole === 'Profesor') {
   return <Message isError={true}>No tienes acceso a la información de caja diaria.</Message>;
 }

 return (
   <Container>
     <Title>Caja Diaria</Title>
     {userRole === 'Dueño' && (
       <Form onSubmit={handleSubmit}>
         <FormRow>
           <InputGroup>
             <Label>Desde:</Label>
             <Input
               type="date"
               value={fechaInicio}
               onChange={(e) => setFechaInicio(e.target.value)}
             />
           </InputGroup>
           <InputGroup>
             <Label>Hasta:</Label>
             <Input
               type="date"
               value={fechaFin}
               onChange={(e) => setFechaFin(e.target.value)}
             />
           </InputGroup>
         </FormRow>
         <FormRow>
           <InputGroup>
             <Label>N° Recibo:</Label>
             <Input
               type="text"
               name="numeroRecibo"
               value={filtros.numeroRecibo}
               onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
               placeholder="Número de Recibo"
             />
           </InputGroup>
           <InputGroup>
  <Label>Alumno:</Label>
  <AutocompleteContainer className="autocomplete-container">
    <SearchInput
      type="text"
      value={searchAlumno}
      onChange={(e) => {
        setSearchAlumno(e.target.value);
        if (!e.target.value) {
          handleFiltroChange('alumnoId', '');
        }
      }}
      placeholder="Buscar alumno..."
    />
    {searchAlumno && alumnosFiltrados.length > 0 && (
      <SuggestionsList>
        {alumnosFiltrados.map(alumno => (
          <SuggestionItem
            key={alumno.id}
            onClick={() => {
              handleFiltroChange('alumnoId', alumno.id.toString());
              setSearchAlumno(`${alumno.apellido} ${alumno.nombre}`);
              fetchCajaDiaria();
            }}
          >
            {alumno.apellido} {alumno.nombre}
          </SuggestionItem>
        ))}
      </SuggestionsList>
    )}
  </AutocompleteContainer>
</InputGroup>

<InputGroup>
  <Label>Concepto:</Label>
  <AutocompleteContainer className="autocomplete-container">
    <SearchInput
      type="text"
      value={searchConcepto}
      onChange={(e) => {
        setSearchConcepto(e.target.value);
        if (!e.target.value) {
          handleFiltroChange('conceptoId', '');
        }
      }}
      placeholder="Buscar concepto..."
    />
    {searchConcepto && conceptosFiltrados.length > 0 && (
      <SuggestionsList>
        {conceptosFiltrados.map(concepto => (
          <SuggestionItem
            key={concepto.id}
            onClick={() => {
              handleFiltroChange('conceptoId', concepto.id.toString());
              setSearchConcepto(concepto.nombre);
              fetchCajaDiaria();
            }}
          >
            {concepto.nombre}
          </SuggestionItem>
        ))}
      </SuggestionsList>
    )}
  </AutocompleteContainer>
</InputGroup>
         </FormRow>
         <FormRow>
           <InputGroup>
             <Label>Periodo:</Label>
             <Input
               type="month"
               name="periodoPago"
               value={filtros.periodoPago}
               onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
             />
           </InputGroup>
           <InputGroup>
             <Label>Término:</Label>
             <Select
               name="fueraDeTermino"
               value={filtros.fueraDeTermino}
               onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
             >
               <option value="">Todos</option>
               <option value="true">Fuera de término</option>
               <option value="false">En término</option>
             </Select>
           </InputGroup>
           <InputGroup>
             <Label>Tipo de Pago:</Label>
             <Select
               name="tipoPago"
               value={filtros.tipoPago}
               onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
             >
               <option value="">Todos</option>
               <option value="EFECTIVO">Efectivo</option>
               <option value="MERCADO_PAGO">Mercado Pago</option>
               <option value="TRANSFERENCIA">Transferencia</option>
               <option value="DEBITO_AUTOMATICO">Débito Automático</option>
               <option value="OTRO">Otro</option>
             </Select>
           </InputGroup>
         </FormRow>
         <Button type="submit" disabled={loading}>
           {loading ? 'Cargando...' : 'Buscar'}
         </Button>
       </Form>
     )}

     {message && (
       <Message isError={message.isError}>{message.text}</Message>
     )}

     {cajaData.recibos.length > 0 && (
       <>
         <Table>
           <thead>
             <Tr>
               <Th>N° Recibo</Th>
               <Th>Fecha</Th>
               <Th>Alumno</Th>
               <Th>Concepto</Th>
               <Th>Periodo</Th>
               <Th>Fuera de Término</Th>
               <Th>Importe</Th>
               <Th>Tipo de Pago</Th>
             </Tr>
           </thead>
           <tbody>
             {cajaData.recibos.map((recibo) => (
               <Tr key={recibo.id}>
                 <Td>{recibo.numeroRecibo}</Td>
                 <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                 <Td>{renderAlumnoNombre(recibo)}</Td>
                 <Td>{recibo.concepto.nombre}</Td>
                 <Td>{recibo.periodoPago}</Td>
                 <Td>{recibo.fueraDeTermino ? 'Sí' : 'No'}</Td>
                 <Td>${recibo.monto.toFixed(0)}</Td>
                 <Td>{recibo.tipoPago}</Td>
               </Tr>
             ))}
           </tbody>
         </Table>
         
         <TotalesContainer>
           <TotalGeneral>Total General: ${cajaData.totalMonto.toFixed(0)}</TotalGeneral>
           <TotalesPorTipo>
             {Object.entries(cajaData.totalPorTipoPago).map(([tipo, total]) => (
               <TotalTipo key={tipo}>
                 <TipoLabel>{tipo}</TipoLabel>
                 <TipoMonto>${total.toFixed(0)}</TipoMonto>
               </TotalTipo>
             ))}
           </TotalesPorTipo>
         </TotalesContainer>
       </>
     )}
   </Container>
 );
};

export default CajaDiaria;