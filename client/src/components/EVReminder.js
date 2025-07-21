import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

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
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Função para mostrar o lembrete
    const triggerReminder = () => {
      setShow(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    };
    // Inicia o timer de 25 minutos
    timerRef.current = setInterval(triggerReminder, 25 * 60 * 1000);
    // Opcional: dispara o primeiro lembrete logo ao entrar
    // triggerReminder();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleOk = () => {
    setShow(false);
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/reminder.mp3" preload="auto" />
      {show && (
        <ModalOverlay>
          <ModalBox>
            <Title>Lembrete de EV</Title>
            <Message>
              Já se passaram 25 minutos!<br />
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