// /components/Dashboard/components/LoadingSkeleton.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonContainer = styled.div`
  padding: 2rem;
`;

const SkeletonBlock = styled.div`
  height: 20px;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 2000px 100%;
  animation: ${shimmer} 2s linear infinite;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const LoadingSkeleton: React.FC = () => (
  <SkeletonContainer>
    <SkeletonBlock style={{ width: '60%', height: '40px', marginBottom: '2rem' }} />
    <SkeletonBlock style={{ width: '100%', height: '200px' }} />
    <SkeletonBlock style={{ width: '100%', height: '200px' }} />
    <SkeletonBlock style={{ width: '100%', height: '200px' }} />
  </SkeletonContainer>
);

export default LoadingSkeleton;