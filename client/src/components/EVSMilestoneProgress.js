import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid #4a6a8a;
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const Title = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #4a6a8a;
  margin-bottom: 8px;
  text-align: center;
`;

const ProgressContainer = styled.div`
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ProgressText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #ffffff;
  text-align: center;
  margin-top: 4px;
`;

const CurrentTotal = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #4CAF50;
  text-align: center;
  font-weight: bold;
`;

const NextMilestone = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #666;
  text-align: center;
  margin-top: 4px;
`;

const EVSMilestoneProgress = () => {
  const [totalEVS, setTotalEVS] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(1000);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProgress();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(loadProgress, 10000);
    
    // Escutar mudanças em tempo real
    const subscription = supabase
      .channel('evs_progress')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'evs' },
        () => {
          setTimeout(loadProgress, 500);
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const loadProgress = async () => {
    try {
      const { count, error } = await supabase
        .from('evs')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Erro ao buscar total de EVS:', error);
        return;
      }

      const total = count || 0;
      setTotalEVS(total);

      // Calcular próximo marco
      const currentMilestone = Math.floor(total / 1000) * 1000;
      const next = currentMilestone + 1000;
      setNextMilestone(next);

      // Calcular progresso
      const progressPercent = ((total - currentMilestone) / 1000) * 100;
      setProgress(Math.min(progressPercent, 100));
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  // Não mostrar se ainda não chegou a 100 EVS
  if (totalEVS < 100) {
    return null;
  }

  return (
    <Container>
      <Title>🎯 PRÓXIMO MARCO</Title>
      <ProgressContainer>
        <ProgressBar>
          <ProgressFill style={{ width: `${progress}%` }} />
        </ProgressBar>
        <ProgressText>
          {totalEVS.toLocaleString()} / {nextMilestone.toLocaleString()} EVS
        </ProgressText>
      </ProgressContainer>
      <CurrentTotal>
        {totalEVS.toLocaleString()} EVS
      </CurrentTotal>
      <NextMilestone>
        Próximo: {nextMilestone.toLocaleString()} EVS
      </NextMilestone>
    </Container>
  );
};

export default EVSMilestoneProgress; 