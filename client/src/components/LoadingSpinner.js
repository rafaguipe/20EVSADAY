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
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid #4a4a4a;
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
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