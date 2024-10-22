// /components/Dashboard/components/MetricCard.tsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Title = styled.h3`
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
`;

const Value = styled.p`
  color: #1e293b;
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0.5rem 0;
`;

const Delta = styled.span<{ isPositive: boolean }>`
  color: ${props => props.isPositive ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Icon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: string;
  icon?: string;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const hoverTransition = {
  type: "spring",
  stiffness: 400,
  damping: 17
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, delta, icon }) => {
  const isPositive = useMemo(() => {
    if (!delta) return true;
    return parseFloat(delta) >= 0;
  }, [delta]);

  return (
    <Card
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ 
        scale: 1.02,
        transition: hoverTransition
      }}
    >
      <Title>
        {icon && <Icon role="img" aria-label={title}>{icon}</Icon>}
        {title}
      </Title>
      <Value>{value}</Value>
      {delta && (
        <Delta isPositive={isPositive}>
          {isPositive ? (
            <>
              <span role="img" aria-label="incremento">↑</span>
              {delta}%
            </>
          ) : (
            <>
              <span role="img" aria-label="decremento">↓</span>
              {delta}%
            </>
          )}
        </Delta>
      )}
    </Card>
  );
};

export default React.memo(MetricCard);