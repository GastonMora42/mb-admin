import React, { useState } from 'react';
import styled from 'styled-components';
import { Profesor, Estilo } from '@/types';

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
  padding: 30px;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 250px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  color: #555;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 120px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  
  &.primary {
    background-color: #FFC001;
    color: #000000;
  }
  
  &.secondary {
    background-color: #f0f0f0;
    color: #333;
  }
`;

interface EditProfesorModalProps {
    profesor: Profesor & {
      estilos?: Array<{ id: number; nombre: string }>;
    };
    estilos: Estilo[];
    onClose: () => void;
    onSave: (profesorData: any) => Promise<void>;
  }
  

  const EditProfesorModal = ({ profesor, estilos, onClose, onSave }: EditProfesorModalProps) => {
    // Extraemos los IDs de los estilos de una manera segura
    const estilosActuales = profesor.estilos || [];
    const estilosIds = estilosActuales.map(e => e.id);
  
    const [formData, setFormData] = useState({
      id: profesor.id,
      nombre: profesor.nombre,
      apellido: profesor.apellido,
      dni: profesor.dni,
      email: profesor.email || '',
      telefono: profesor.telefono || '',
      fechaNacimiento: profesor.fechaNacimiento ? new Date(profesor.fechaNacimiento).toISOString().split('T')[0] : '',
      direccion: profesor.direccion || '',
      cuit: profesor.cuit || '',
      porcentajePorDefecto: profesor.porcentajePorDefecto || 60,
      porcentajeClasesSueltasPorDefecto: profesor.porcentajeClasesSueltasPorDefecto || 80,
      estilosIds: estilosIds
    });  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'estilosIds' && (e.target as HTMLSelectElement).multiple) {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions,
        option => parseInt(option.value)
      );
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
    <ModalOverlay>
      <ModalContent>
        <h2>Editar Profesor</h2>
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <InputGroup>
              <Label>Nombre:</Label>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Apellido:</Label>
              <Input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>DNI:</Label>
              <Input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                required
                disabled
              />
            </InputGroup>

            <InputGroup>
              <Label>Email:</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label>Teléfono:</Label>
              <Input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label>Fecha de Nacimiento:</Label>
              <Input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label>Dirección:</Label>
              <Input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label>CUIT:</Label>
              <Input
                type="text"
                name="cuit"
                value={formData.cuit}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label>Porcentaje por Defecto (%):</Label>
              <Input
                type="number"
                name="porcentajePorDefecto"
                value={formData.porcentajePorDefecto}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </InputGroup>

            <InputGroup>
              <Label>Porcentaje Clases Sueltas (%):</Label>
              <Input
                type="number"
                name="porcentajeClasesSueltasPorDefecto"
                value={formData.porcentajeClasesSueltasPorDefecto}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </InputGroup>

            <InputGroup>
              <Label>Estilos:</Label>
              <Select
                multiple
                name="estilosIds"
                value={formData.estilosIds.map(String)}
                onChange={handleInputChange}
              >
                {estilos.map(estilo => (
                  <option key={estilo.id} value={estilo.id}>
                    {estilo.nombre}
                  </option>
                ))}
              </Select>
            </InputGroup>
          </FormSection>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="primary">
              Guardar Cambios
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditProfesorModal;