import styled from 'styled-components';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Estilo } from '@/types/alumnos-estilos';

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/fondo-mb.png') center/cover no-repeat;
    filter: blur(8px) brightness(0.7);
    z-index: -1;
  }
`;

const GradientBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(102, 51, 153, 0.3) 0%,
    rgba(102, 51, 153, 0) 50%,
    rgba(102, 51, 153, 0.3) 100%
  );
  pointer-events: none;
  z-index: -1;
`;

const TermsModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow-y: auto;
`;

const TermsContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  
  .highlight {
    color: #663399;
    font-weight: bold;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  gap: 10px;
`;

const TermsButton = styled.button`
  background: #663399;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin: 20px 0;
  width: 100%;
  
  &:hover {
    background: #7a42b5;
  }
`;

const SuccessAlert = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 30px 50px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeInScale 0.5s ease-out;
  z-index: 1000;
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 30px;
`;

const SuccessTitle = styled.h2`
  color: #2E7D32;
  margin-bottom: 10px;
  font-size: 24px;
`;

const SuccessText = styled.p`
  color: #555;
  font-size: 16px;
  margin-bottom: 20px;
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  const getTermsText = () => {
    const estilosSeleccionados = formData.estilosIds
      .map(id => estilos.find(e => e.id.toString() === id)?.nombre)
      .filter(Boolean)
      .join(', ');

    return `ESTE CONTRATO ES DE CARÁCTER VINCULANTE CON NUESTRA INSTITUCIÓN Y SU CUMPLIMIENTO ES OBLIGATORIO.

YO <span class="highlight">${formData.nombre} ${formData.apellido}</span>
TEL: <span class="highlight">${formData.telefono}</span>
MAIL: <span class="highlight">${formData.email}</span>
NUM. EMER: <span class="highlight">${formData.numeroEmergencia}</span>
DIRECCION: <span class="highlight">${formData.direccion}</span>
DNI: <span class="highlight">${formData.dni}</span>
FEC. NAC: <span class="highlight">${formData.fechaNacimiento}</span>

Me comprometo a cumplir con el siguiente contrato, y doy fe que me encuentro en óptimas condiciones. Que NO POSEO NINGUNA ENFERMEDAD, AFECCIÓN, NI DIFICULTAD FISICA QUE ME IMPIDA O PERJUDIQUE al realizar las clases que brinda MB Estudio de Danzas. Y la institución no es responsable de nada que pueda ocurrirme allí.

ESTILO: <span class="highlight">${estilosSeleccionados}</span>

${formData.nombreTutor && `
En el caso que el alumno sea menor de edad:
YO (nombre y apellido del padre/madre o tutor) <span class="highlight">${formData.nombreTutor}</span>
DNI: <span class="highlight">${formData.dniTutor}</span>
DIRECCIÓN: <span class="highlight">${formData.direccion}</span>

Me comprometo a cumplir con el siguiente contrato, y doy fe que mi hijo/a se encuentra en optimas condiciones, que NO POSEE NINGUNA ENFERMEDAD, AFECCIÓN, NI DIFICULTAD FISICA QUE LE IMPIDA O PERJUDIQUE al realizar las clases que brinda MB Estudio de Danzas.
`}

-Me comprometo a abonar el pago de la cuota del 1 al 10 de cada mes, asumiendo que desde el dia 11 tendrá recargo.
- entiendo que hay actualización de cuota en el mes de Mayo, agosto y Noviembre.
-entiendo que NO SE PERMITEN ACOMPAÑANTES DENTRO DE MB. Solo el alumno asistente.
-entiendo que no se puede ingresar con bicicletas ni ningún medio similar.
-Entiendo que los días feriados y 1 semana en las vacaciones de invierno no se dictarán clases, pero debo abonar el mes correspondiente.
-Entiendo que para participar en los shows debo tener la cuota al día. Inclusive el mes de Diciembre que se abona completo.
-Asumo que las clases en las que falte, se cancelen por alerta meteorológica o por aislamiento no son recuperadas.
-Estoy en conocimiento que en las clases filman videos y sacan fotos que son subidas a las redes, y lo autorizo.`;
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
    
    // Validación de campos requeridos y formato de fecha
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.fechaNacimiento) {
      setMessage({
        text: 'Los campos marcados con * son obligatorios',
        isError: true
      });
      return;
    }
  
    // Validar formato de fecha
    const fechaNacimiento = new Date(formData.fechaNacimiento);
    if (isNaN(fechaNacimiento.getTime())) {
      setMessage({
        text: 'La fecha de nacimiento no es válida',
        isError: true
      });
      return;
    }
  
    if (!acceptedTerms) {
      setMessage({
        text: 'Debes aceptar los términos y condiciones',
        isError: true
      });
      return;
    }
  
    setLoading(true);
    
    try {
      // Preparar los datos eliminando strings vacíos
      const alumnoData = {
        ...formData,
        email: formData.email || null,
        telefono: formData.telefono || null,
        numeroEmergencia: formData.numeroEmergencia || null,
        direccion: formData.direccion || null,
        obraSocial: formData.obraSocial || null,
        nombreTutor: formData.nombreTutor || null,
        dniTutor: formData.dniTutor || null,
        tipoAlumno: 'regular',
        estilosIds: formData.estilosIds.map(id => parseInt(id)),
        activo: true,
        fechaNacimiento: fechaNacimiento.toISOString() // Convertir a formato ISO
      };
  
      const res = await fetch('/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumnoData),
      });
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al registrar alumno');
      }
  
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Resetear el formulario
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
        setAcceptedTerms(false);
      }, 3000);
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
      <GradientBorder />
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
            />
          </InputGroup>

          <InputGroup>
            <Label>Fecha de Nacimiento *</Label>
            <Input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
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
            >
              {estilos.map(estilo => (
                <option key={estilo.id} value={estilo.id}>
                  {estilo.nombre}
                </option>
              ))}
            </Select>
          </InputGroup>

          {!acceptedTerms && (
            <TermsButton 
              type="button"
              onClick={() => setShowTerms(true)}
            >
              Leer y Aceptar Términos y Condiciones
            </TermsButton>
          )}

          {acceptedTerms && (
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Completar Registro'}
            </SubmitButton>
          )}
        </Form>
      </FormContainer>

      {showTerms && (
        <TermsModal>
          <Title>Términos y Condiciones</Title>
          <TermsContent dangerouslySetInnerHTML={{ __html: getTermsText() }} />
          
          <CheckboxContainer>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="acceptTerms">
              He leído y acepto los términos y condiciones
            </label>
          </CheckboxContainer>
          
          <TermsButton 
            onClick={() => setShowTerms(false)}
          >
            Cerrar
          </TermsButton>
        </TermsModal>
      )}

      {showSuccess && (
        <SuccessAlert>
          <SuccessIcon>✓</SuccessIcon>
          <SuccessTitle>¡Registro Exitoso!</SuccessTitle>
          <SuccessText>
            ¡Bienvenida/o a nuestra Academia!💛✨<br/>
            Tu registro ha sido completado con éxito.
          </SuccessText>
        </SuccessAlert>
      )}
    </PageWrapper>
  );
}