import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useEVTimer } from '../contexts/EVTimerContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: #222;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  text-align: center;
  max-width: 90vw;
  min-width: 320px;
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 1.1rem;
  margin-bottom: 16px;
`;

const Message = styled.p`
  color: #eee;
  font-size: 1rem;
  margin-bottom: 24px;
`;

const OkButton = styled.button`
  background: #4a8a4a;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #357a35;
  }
`;

const EVReminder = () => {
  const [show, setShow] = useState(false);
  const { shouldTriggerReminder, consumeReminder, intervalMinutes } = useEVTimer();

  useEffect(() => {
    if (shouldTriggerReminder) {
      setShow(true);
      // O som já foi tocado no contexto EVTimer
    }
  }, [shouldTriggerReminder]);

  const handleOk = () => {
    setShow(false);
    consumeReminder();
  };

  return (
    <>
      {show && (
        <ModalOverlay>
          <ModalBox>
            <Title>Lembrete de EV</Title>
            <Message>
              Já se passaram {intervalMinutes} minutos!<br />
              Que tal registrar um EV e avançar na sua meta diária?
            </Message>
            <OkButton onClick={handleOk}>OK</OkButton>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
};

export default EVReminder; 