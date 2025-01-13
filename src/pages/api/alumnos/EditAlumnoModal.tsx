import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e6ac00;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

interface EditAlumnoModalProps {
  alumno: any;
  estilos: any[];
  onClose: () => void;
  onSave: (alumnoData: any) => Promise<void>;
}

const EditAlumnoModal: React.FC<EditAlumnoModalProps> = ({
  alumno,
  estilos,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    id: alumno.id,
    nombre: alumno.nombre,
    apellido: alumno.apellido,
    dni: alumno.dni,
    fechaNacimiento: alumno.fechaNacimiento.split('T')[0],
    email: alumno.email || '',
    telefono: alumno.telefono || '',
    numeroEmergencia: alumno.numeroEmergencia || '',
    direccion: alumno.direccion || '',
    obraSocial: alumno.obraSocial || '',
    nombreTutor: alumno.nombreTutor || '',
    dniTutor: alumno.dniTutor || '',
    notas: alumno.notas || '',
    estilosIds: alumno.alumnoEstilos?.map((ae: any) => ae.estilo.id) || [],
    tipoAlumno: 'regular',
    descuentoManual: alumno.descuentosVigentes?.find((d: any) => !d.descuento.esAutomatico)?.descuento.porcentaje || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'estilosIds' && e.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2>Editar Alumno</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Nombre"
            required
          />
          <Input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            placeholder="Apellido"
            required
          />
          <Input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleInputChange}
            placeholder="DNI"
            required
          />
          <Input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleInputChange}
            required
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
          <Input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="Teléfono"
          />
          <Input
            type="tel"
            name="numeroEmergencia"
            value={formData.numeroEmergencia}
            onChange={handleInputChange}
            placeholder="Número de Emergencia"
          />
          <Input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            placeholder="Dirección"
          />
          <Input
            type="text"
            name="obraSocial"
            value={formData.obraSocial}
            onChange={handleInputChange}
            placeholder="Obra Social"
          />
          <Input
            type="text"
            name="nombreTutor"
            value={formData.nombreTutor}
            onChange={handleInputChange}
            placeholder="Nombre del Tutor"
          />
          <Input
            type="text"
            name="dniTutor"
            value={formData.dniTutor}
            onChange={handleInputChange}
            placeholder="DNI del Tutor"
          />
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            placeholder="Notas"
          />
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
          <Input
            type="number"
            name="descuentoManual"
            value={formData.descuentoManual}
            onChange={handleInputChange}
            placeholder="Descuento Manual (%)"
            min="0"
            max="100"
            step="1"
          />
          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditAlumnoModal;