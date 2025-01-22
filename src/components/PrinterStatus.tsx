// components/PrinterStatus.tsx
import { useState } from 'react';
import styled from 'styled-components';

const AlertContainer = styled.div<{ type: 'success' | 'warning' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background-color: ${props => props.type === 'success' ? '#e8f5e9' : '#fff3cd'};
  border: 1px solid ${props => props.type === 'success' ? '#4caf50' : '#ffc107'};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  color: #666;
  &:hover {
    color: #333;
  }
`;

interface PrinterStatusProps {
  isAvailable: boolean;
  onClose: () => void;
}

export const PrinterStatus: React.FC<PrinterStatusProps> = ({ isAvailable, onClose }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <AlertContainer type={isAvailable ? 'success' : 'warning'}>
      <span>
        {isAvailable ? (
          <>🖨️ Impresora conectada y lista</>
        ) : (
          <>⚠️ Impresora no disponible - Los recibos se generarán sin impresión</>
        )}
      </span>
      <CloseButton onClick={() => {
        setVisible(false);
        onClose();
      }}>
        ×
      </CloseButton>
    </AlertContainer>
  );
};