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

const TabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const TabCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid ${props => props.visible ? '#4CAF50' : '#666'};
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TabInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TabName = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
`;

const TabDescription = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #6a6a6a;
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

const TabVisibilityControl = () => {
  const [tabSettings, setTabSettings] = useState({
    sobre_visible: false,
    loja_visible: false,
    multimidia_visible: true,
    chat_visible: true,
    badges_visible: true,
    leaderboard_visible: true,
    votacao_visible: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTabSettings();
  }, []);

  const loadTabSettings = async () => {
    try {
      setLoading(true);
      
      const tabs = [
        'sobre_visible',
        'loja_visible', 
        'multimidia_visible',
        'chat_visible',
        'badges_visible',
        'leaderboard_visible',
        'votacao_visible'
      ];

      const settings = {};
      
      for (const tab of tabs) {
        const { data, error } = await supabase
          .rpc('get_system_setting', {
            p_key: tab
          });

        if (error) {
          console.error(`Erro ao carregar configuração ${tab}:`, error);
          settings[tab] = tab === 'multimidia_visible' || tab === 'chat_visible' || tab === 'badges_visible' || tab === 'leaderboard_visible';
        } else {
          settings[tab] = data === 'true';
        }
      }

      setTabSettings(settings);
    } catch (error) {
      console.error('Erro ao carregar configurações das abas:', error);
      toast.error('Erro ao carregar configurações das abas');
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = async (tabKey) => {
    try {
      setSaving(true);
      const newValue = !tabSettings[tabKey];
      
      const { error } = await supabase
        .rpc('set_system_setting', {
          p_key: tabKey,
          p_value: newValue.toString(),
          p_description: `Controla se a aba ${tabKey.replace('_visible', '')} é visível para todos os usuários`
        });

      if (error) {
        console.error('Erro ao salvar configuração:', error);
        toast.error('Erro ao salvar configuração da aba');
        return;
      }

      setTabSettings(prev => ({
        ...prev,
        [tabKey]: newValue
      }));
      
      toast.success(`Aba ${getTabDisplayName(tabKey)} ${newValue ? 'ativada' : 'desativada'}!`);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração da aba');
    } finally {
      setSaving(false);
    }
  };

  const getTabDisplayName = (tabKey) => {
    const names = {
      'sobre_visible': 'Sobre',
      'loja_visible': 'Loja',
      'multimidia_visible': 'Multimídia',
      'chat_visible': 'Chat',
      'badges_visible': 'Badges',
      'leaderboard_visible': 'Ranking',
      'votacao_visible': 'Votação'
    };
    return names[tabKey] || tabKey;
  };

  const getTabDescription = (tabKey) => {
    const descriptions = {
      'sobre_visible': 'Informações sobre GPC e Liderare',
      'loja_visible': 'Produtos e eventos',
      'multimidia_visible': 'Vídeos e referências',
      'chat_visible': 'Chat entre usuários',
      'badges_visible': 'Conquistas e badges',
      'leaderboard_visible': 'Ranking de usuários',
      'votacao_visible': 'Votação do nome do mascote'
    };
    return descriptions[tabKey] || '';
  };

  const getTabIcon = (tabKey) => {
    const icons = {
      'sobre_visible': 'ℹ️',
      'loja_visible': '🛒',
      'multimidia_visible': '📺',
      'chat_visible': '💬',
      'badges_visible': '🏆',
      'leaderboard_visible': '📊',
      'votacao_visible': '🗳️'
    };
    return icons[tabKey] || '📄';
  };

  if (loading) {
    return (
      <Container>
        <Title>📋 Controle de Visibilidade das Abas</Title>
        <Description>Carregando configurações...</Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📋 Controle de Visibilidade das Abas</Title>
      <Description>
        Controla quais abas são visíveis para todos os usuários. Abas desativadas ficam visíveis apenas para administradores.
      </Description>

      <TabGrid>
        {Object.entries(tabSettings).map(([tabKey, isVisible]) => (
          <TabCard key={tabKey} visible={isVisible}>
            <TabInfo>
              <TabName>
                {getTabIcon(tabKey)} {getTabDisplayName(tabKey)}
              </TabName>
              <TabDescription>{getTabDescription(tabKey)}</TabDescription>
            </TabInfo>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={isVisible}
                onChange={() => toggleTab(tabKey)}
                disabled={saving}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </TabCard>
        ))}
      </TabGrid>

      <StatusText visible={Object.values(tabSettings).some(v => v)}>
        {Object.values(tabSettings).some(v => v) 
          ? '✅ Algumas abas estão ativas para todos os usuários' 
          : '🔒 Todas as abas estão restritas apenas para administradores'}
      </StatusText>

      <InfoBox>
        <InfoText>
          <strong>Como funciona:</strong><br />
          • <strong>Desativado:</strong> Apenas admins veem a aba<br />
          • <strong>Ativado:</strong> Todos os usuários veem a aba<br />
          • Mudanças são aplicadas em tempo real<br />
          • Dashboard e Perfil sempre ficam visíveis
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default TabVisibilityControl; 