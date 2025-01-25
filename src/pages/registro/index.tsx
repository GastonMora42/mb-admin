// src/pages/registro.tsx
import styled from 'styled-components';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Estilo } from '@/types/alumnos-estilos';

const PageWrapper = styled.div`
 min-height: 100vh;
 background: linear-gradient(to bottom right, #663399, #4B0082);
 padding: 20px;
`;

const LogoContainer = styled.div`
 display: flex;
 justify-content: center;
 margin: 20px 0 40px;
`;

const FormContainer = styled.div`
 max-width: 800px;
 margin: 0 auto;
 padding: 30px;
 background: rgba(255, 255, 255, 0.95);
 border-radius: 12px;
 box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
 color: #FFC001;
 text-align: center;
 font-size: 2.5em;
 margin-bottom: 30px;
 text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
`;

const Form = styled.form`
 display: grid;
 grid-template-columns: repeat(2, 1fr);
 gap: 20px;
`;

const InputGroup = styled.div`
 margin-bottom: 20px;
`;

const Label = styled.label`
 display: block;
 color: #663399;
 margin-bottom: 8px;
 font-weight: 500;
`;

const Input = styled.input`
 width: 100%;
 padding: 12px;
 border: 2px solid #FFC001;
 border-radius: 8px;
 font-size: 16px;
 
 &:focus {
   outline: none;
   border-color: #663399;
 }
`;

const Select = styled.select`
 width: 100%;
 padding: 12px;
 border: 2px solid #FFC001;
 border-radius: 8px;
 font-size: 16px;
 
 &:focus {
   outline: none;
   border-color: #663399;
 }
`;

const SubmitButton = styled.button`
 background: #FFC001;
 color: #663399;
 padding: 15px 30px;
 border: none;
 border-radius: 8px;
 font-size: 18px;
 font-weight: bold;
 cursor: pointer;
 transition: all 0.3s ease;
 grid-column: span 2;
 
 &:hover {
   background: #663399;
   color: #FFC001;
 }
`;

const Message = styled.div<{ isError?: boolean }>`
 grid-column: span 2;
 padding: 12px;
 border-radius: 8px;
 text-align: center;
 background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
 color: ${props => props.isError ? '#c62828' : '#2e7d32'};
 margin-bottom: 20px;
`;

interface FormData {
 nombre: string;
 apellido: string;
 dni: string;
 fechaNacimiento: string;
 email: string;
 telefono: string;
 numeroEmergencia: string;
 direccion: string;
 obraSocial: string;
 nombreTutor: string;
 dniTutor: string;
 estilosIds: string[];
}

export default function RegistroAlumno() {
 const [formData, setFormData] = useState<FormData>({
   nombre: '',
   apellido: '',
   dni: '',
   fechaNacimiento: '',
   email: '',
   telefono: '',
   numeroEmergencia: '',
   direccion: '',
   obraSocial: '',
   nombreTutor: '',
   dniTutor: '',
   estilosIds: []
 });

 const [estilos, setEstilos] = useState<Estilo[]>([]);
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<{text: string; isError: boolean} | null>(null);

 useEffect(() => {
   fetchEstilos();
 }, []);

 const fetchEstilos = async () => {
   try {
     const res = await fetch('/api/estilos');
     if (!res.ok) throw new Error('Error al obtener estilos');
     const data = await res.json();
     setEstilos(data);
   } catch (error) {
     console.error('Error:', error);
     setMessage({text: 'Error al cargar los estilos', isError: true});
   }
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   const { name, value } = e.target;
   
   if (name === 'estilosIds' && e.target instanceof HTMLSelectElement) {
     const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
     setFormData(prev => ({...prev, [name]: selectedOptions}));
   } else {
     setFormData(prev => ({...prev, [name]: value}));
   }
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);
   
   try {
     const res = await fetch('/api/alumnos', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         ...formData,
         tipoAlumno: 'regular',
         estilosIds: formData.estilosIds.map(id => parseInt(id)),
         activo: true
       }),
     });

     if (!res.ok) {
       const error = await res.json();
       throw new Error(error.error || 'Error al registrar alumno');
     }

     setMessage({text: '¡Registro exitoso! Bienvenido/a a la academia', isError: false});
     setFormData({
       nombre: '',
       apellido: '',
       dni: '',
       fechaNacimiento: '',
       email: '',
       telefono: '',
       numeroEmergencia: '',
       direccion: '',
       obraSocial: '',
       nombreTutor: '',
       dniTutor: '',
       estilosIds: []
     });
   } catch (error) {
     console.error('Error:', error);
     setMessage({
       text: error instanceof Error ? error.message : 'Error al registrar alumno',
       isError: true
     });
   } finally {
     setLoading(false);
   }
 };

 return (
   <PageWrapper>
     <LogoContainer>
       <Image 
         src="/mb-logo.png"
         alt="Logo Academia"
         width={200} 
         height={200}
         priority
       />
     </LogoContainer>
     
     <FormContainer>
       <Title>Registro de Nuevo Alumno</Title>
       
       <Form onSubmit={handleSubmit}>
         {message && (
           <Message isError={message.isError}>
             {message.text}
           </Message>
         )}
         
         <InputGroup>
           <Label>Nombre *</Label>
           <Input
             type="text"
             name="nombre"
             value={formData.nombre}
             onChange={handleInputChange}
             required
           />
         </InputGroup>

         <InputGroup>
           <Label>Apellido *</Label>
           <Input
             type="text"
             name="apellido"
             value={formData.apellido}
             onChange={handleInputChange}
             required
           />
         </InputGroup>

         <InputGroup>
           <Label>DNI *</Label>
           <Input
             type="text"
             name="dni"
             value={formData.dni}
             onChange={handleInputChange}
             required
           />
         </InputGroup>

         <InputGroup>
           <Label>Fecha de Nacimiento *</Label>
           <Input
             type="date"
             name="fechaNacimiento"
             value={formData.fechaNacimiento}
             onChange={handleInputChange}
             required
           />
         </InputGroup>

         <InputGroup>
           <Label>Email</Label>
           <Input
             type="email"
             name="email"
             value={formData.email}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>Teléfono</Label>
           <Input
             type="tel"
             name="telefono"
             value={formData.telefono}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>Teléfono de Emergencia</Label>
           <Input
             type="tel"
             name="numeroEmergencia"
             value={formData.numeroEmergencia}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>Dirección</Label>
           <Input
             type="text"
             name="direccion"
             value={formData.direccion}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>Obra Social</Label>
           <Input
             type="text"
             name="obraSocial"
             value={formData.obraSocial}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>Nombre del Tutor</Label>
           <Input
             type="text"
             name="nombreTutor"
             value={formData.nombreTutor}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>DNI del Tutor</Label>
           <Input
             type="text"
             name="dniTutor"
             value={formData.dniTutor}
             onChange={handleInputChange}
           />
         </InputGroup>

         <InputGroup>
           <Label>Estilos de Danza *</Label>
           <Select
             name="estilosIds"
             multiple
             value={formData.estilosIds}
             onChange={handleInputChange}
             required
           >
             {estilos.map(estilo => (
               <option key={estilo.id} value={estilo.id}>
                 {estilo.nombre}
               </option>
             ))}
           </Select>
         </InputGroup>

         <SubmitButton type="submit" disabled={loading}>
           {loading ? 'Registrando...' : 'Completar Registro'}
         </SubmitButton>
       </Form>
     </FormContainer>
   </PageWrapper>
 );
}