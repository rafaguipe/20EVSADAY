import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  background: transparent;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 4px solid #4a4a4a;
  border-top: 4px solid #269b85;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-family: inherit;
  font-size: 14px;
  color: inherit;
  animation: ${pulse} 2s ease-in-out infinite;
  text-align: center;
`;

const LoadingSpinner = () => {
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>CARREGANDO...</LoadingText>
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 