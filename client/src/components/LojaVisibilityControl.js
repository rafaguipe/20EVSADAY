import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: #2a2a2a;
  border: 2px solid #4a4a4a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const ToggleLabel = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #4CAF50;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #666;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const StatusText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${props => props.visible ? '#4CAF50' : '#FF9800'};
  margin-top: 10px;
`;

const InfoBox = styled.div`
  background: rgba(74, 106, 138, 0.1);
  border: 1px solid #4a6a8a;
  border-radius: 6px;
  padding: 10px;
  margin-top: 15px;
`;

const InfoText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #4a6a8a;
  margin: 0;
  line-height: 1.4;
`;

const LojaVisibilityControl = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVisibilitySetting();
  }, []);

  const loadVisibilitySetting = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_system_setting', {
          p_key: 'loja_visible'
        });

      if (error) {
        console.error('Erro ao carregar configuração:', error);
        toast.error('Erro ao carregar configuração da loja');
        return;
      }

      setIsVisible(data === 'true');
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração da loja');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async () => {
    try {
      setSaving(true);
      const newValue = !isVisible;
      
      const { error } = await supabase
        .rpc('set_system_setting', {
          p_key: 'loja_visible',
          p_value: newValue.toString(),
          p_description: 'Controla se a aba Loja é visível para todos os usuários'
        });

      if (error) {
        console.error('Erro ao salvar configuração:', error);
        toast.error('Erro ao salvar configuração da loja');
        return;
      }

      setIsVisible(newValue);
      toast.success(`Loja ${newValue ? 'ativada' : 'desativada'} para todos os usuários!`);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração da loja');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>🛒 Controle da Loja</Title>
        <Description>Carregando configurações...</Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🛒 Controle da Loja</Title>
      <Description>
        Controla se a aba "Loja" é visível para todos os usuários ou apenas para administradores
      </Description>

      <ToggleContainer>
        <ToggleLabel>Visível para todos:</ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={isVisible}
            onChange={toggleVisibility}
            disabled={saving}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      <StatusText visible={isVisible}>
        {isVisible ? '✅ Loja visível para todos os usuários' : '🔒 Loja visível apenas para administradores'}
      </StatusText>

      <InfoBox>
        <InfoText>
          <strong>Como funciona:</strong><br />
          • <strong>Desativado:</strong> Apenas admins veem a aba Loja<br />
          • <strong>Ativado:</strong> Todos os usuários veem a aba Loja<br />
          • Mudanças são aplicadas em tempo real
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default LojaVisibilityControl; 