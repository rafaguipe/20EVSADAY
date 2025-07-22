import React from 'react';
import styled from 'styled-components';
import { TIMEZONE_INFO, getCurrentTimezone } from '../utils/dateUtils';

const Container = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const Title = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.div`
  color: #6a6a6a;
  text-transform: uppercase;
`;

const Value = styled.div`
  color: #ffffff;
`;

const Warning = styled.div`
  color: #ffaa00;
  font-size: 9px;
  margin-top: 8px;
  text-align: center;
`;

const TimezoneInfo = () => {
  const currentTimezone = getCurrentTimezone();
  const isBrasilia = currentTimezone === TIMEZONE_INFO.name;
  const isDaylightSaving = TIMEZONE_INFO.isDaylightSaving();

  return (
    <Container>
      <Title>⏰ Fuso Horário do Sistema</Title>
      <InfoGrid>
        <InfoItem>
          <Label>Fuso Padrão:</Label>
          <Value>{TIMEZONE_INFO.description}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Seu Fuso:</Label>
          <Value>{currentTimezone}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Offset:</Label>
          <Value>{TIMEZONE_INFO.offset}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Horário de Verão:</Label>
          <Value>{isDaylightSaving ? 'Sim' : 'Não'}</Value>
        </InfoItem>
      </InfoGrid>
      
      {!isBrasilia && (
        <Warning>
          ⚠️ Seu fuso horário é diferente do padrão do sistema. 
          O fechamento do dia será baseado no horário de Brasília.
        </Warning>
      )}
    </Container>
  );
};

export default TimezoneInfo; 