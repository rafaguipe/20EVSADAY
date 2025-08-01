import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const PopupContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 4px solid #FFD700;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
  animation: celebrate 0.8s ease-out;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
  
  @keyframes celebrate {
    0% { 
      transform: scale(0.5) rotate(-10deg);
      opacity: 0;
    }
    50% { 
      transform: scale(1.1) rotate(5deg);
    }
    100% { 
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
`;

const CelebrationIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 1s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #FFD700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const MilestoneText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 30px;
  line-height: 1.4;
`;

const TotalEVS = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 32px;
  color: #4CAF50;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Message = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 30px;
`;

const CloseButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: linear-gradient(135deg, #45a049 0%, #4CAF50 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
`;

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  animation: confetti 3s linear infinite;
  top: -10px;
  left: ${props => props.left}%;
  
  @keyframes confetti {
    0% {
      transform: translateY(-10px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;

const EVSMilestoneTracker = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [totalEVS, setTotalEVS] = useState(0);
  const [lastCheckedMilestone, setLastCheckedMilestone] = useState(0);

  useEffect(() => {
    checkMilestones();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkMilestones, 30000);
    
    // Escutar mudanças na tabela evs em tempo real
    const subscription = supabase
      .channel('evs_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'evs' },
        () => {
          // Verificar marcos imediatamente quando um EV é adicionado
          setTimeout(checkMilestones, 1000); // Pequeno delay para garantir que o EV foi contabilizado
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const checkMilestones = async () => {
    try {
      // Buscar total de EVS
      const { count, error } = await supabase
        .from('evs')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Erro ao buscar total de EVS:', error);
        return;
      }

      const total = count || 0;
      setTotalEVS(total);

      // Calcular o próximo marco
      const nextMilestone = Math.floor(total / 1000) * 1000;
      
      // Se chegamos a um novo marco e não é 0
      if (nextMilestone > 0 && nextMilestone > lastCheckedMilestone) {
        setCurrentMilestone(nextMilestone);
        setLastCheckedMilestone(nextMilestone);
        setShowPopup(true);
        
        // Tocar som de vitória
        playVictorySound();
        
        // Salvar o marco verificado
        localStorage.setItem('lastEVSMilestone', nextMilestone.toString());
      }
    } catch (error) {
      console.error('Erro ao verificar marcos de EVS:', error);
    }
  };

  const playVictorySound = () => {
    try {
      const audio = new Audio('/sounds/victory.mp3');
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.log('Erro ao tocar som de vitória:', error);
      });
    } catch (error) {
      console.log('Erro ao carregar som de vitória:', error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // Carregar último marco verificado do localStorage
  useEffect(() => {
    const lastMilestone = localStorage.getItem('lastEVSMilestone');
    if (lastMilestone) {
      setLastCheckedMilestone(parseInt(lastMilestone));
    }
  }, []);

  if (!showPopup) {
    return null;
  }

  // Gerar confetes
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  const confettiElements = Array.from({ length: 20 }, (_, i) => (
    <Confetti
      key={i}
      color={confettiColors[i % confettiColors.length]}
      left={Math.random() * 100}
    />
  ));

  return (
    <Overlay>
      {confettiElements}
      <PopupContainer>
        <CelebrationIcon>🎉</CelebrationIcon>
        <Title>MARCO ALCANÇADO!</Title>
        <MilestoneText>
          Parabéns! A comunidade atingiu
        </MilestoneText>
        <TotalEVS>{currentMilestone.toLocaleString()} EVS</TotalEVS>
        <Message>
          🎯 Um marco incrível foi alcançado!<br/>
          Continue praticando Estados Vibracionais<br/>
          e ajude a comunidade a crescer ainda mais!
        </Message>
        <CloseButton onClick={closePopup}>
          🎊 CELEBRAR!
        </CloseButton>
      </PopupContainer>
    </Overlay>
  );
};

export default EVSMilestoneTracker; 