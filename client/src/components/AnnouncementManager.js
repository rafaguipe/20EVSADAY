import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ControlSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(74, 106, 138, 0.1);
  border-radius: 8px;
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
  background-color: #ccc;
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
  font-size: 12px;
  color: ${props => props.active ? '#4CAF50' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const TextArea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  background: #1a1a1a;
  color: #ffffff;
  border: 2px solid #4a6a8a;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  outline: none;
  margin-bottom: 16px;
  
  &:focus {
    border-color: #357a6a;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const Button = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  background: #4a6a8a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: 12px;
  
  &:hover {
    background: #357a6a;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const DangerButton = styled(Button)`
  background: #dc3545;
  
  &:hover {
    background: #c82333;
  }
`;

const InfoBox = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const InfoText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffc107;
  margin: 0;
  line-height: 1.4;
`;

const AnnouncementManager = () => {
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnnouncementSettings();
  }, []);

  const loadAnnouncementSettings = async () => {
    try {
      setLoading(true);
      
      // Carregar configuração de ativação
      const { data: enabledData, error: enabledError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'announcement_enabled'
        });

      if (enabledError) {
        console.error('Erro ao carregar status do anúncio:', enabledError);
      } else {
        setAnnouncementEnabled(enabledData === 'true');
      }

      // Carregar texto do anúncio
      const { data: textData, error: textError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'announcement_text'
        });

      if (textError) {
        console.error('Erro ao carregar texto do anúncio:', textError);
      } else {
        setAnnouncementText(textData || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do anúncio:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnnouncement = async () => {
    try {
      setSaving(true);
      const newStatus = !announcementEnabled;
      
      const { error } = await supabase
        .rpc('set_system_setting', {
          p_key: 'announcement_enabled',
          p_value: newStatus.toString(),
          p_description: 'Controla se o anúncio pop-up está ativo'
        });

      if (error) {
        console.error('Erro ao salvar status do anúncio:', error);
        toast.error('Erro ao salvar configuração');
        return;
      }

      setAnnouncementEnabled(newStatus);
      toast.success(`Anúncio ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alternar anúncio:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const saveAnnouncementText = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .rpc('set_system_setting', {
          p_key: 'announcement_text',
          p_value: announcementText,
          p_description: 'Texto do anúncio pop-up'
        });

      if (error) {
        console.error('Erro ao salvar texto do anúncio:', error);
        toast.error('Erro ao salvar texto');
        return;
      }

      toast.success('Texto do anúncio salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar texto do anúncio:', error);
      toast.error('Erro ao salvar texto');
    } finally {
      setSaving(false);
    }
  };

  const clearAnnouncementText = () => {
    setAnnouncementText('');
  };

  if (loading) {
    return (
      <Container>
        <Title>📢 Gerenciar Anúncios</Title>
        <Description>Carregando configurações...</Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📢 Gerenciar Anúncios</Title>
      <Description>
        Configure anúncios que aparecem como pop-up quando os usuários recarregam a página.
        Útil para comunicados importantes, novidades ou avisos.
      </Description>

      <ControlSection>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={announcementEnabled}
            onChange={toggleAnnouncement}
            disabled={saving}
          />
          <ToggleSlider />
        </ToggleSwitch>
        <StatusText active={announcementEnabled}>
          {announcementEnabled ? 'ANÚNCIO ATIVO' : 'ANÚNCIO DESATIVADO'}
        </StatusText>
      </ControlSection>

      <div>
        <TextArea
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          placeholder="Digite aqui o texto do anúncio que aparecerá no pop-up..."
          maxLength={500}
        />
        
        <div>
          <Button onClick={saveAnnouncementText} disabled={saving}>
            {saving ? 'Salvando...' : '💾 Salvar Texto'}
          </Button>
          <DangerButton onClick={clearAnnouncementText} disabled={saving}>
            🗑️ Limpar Texto
          </DangerButton>
        </div>
      </div>

      <InfoBox>
        <InfoText>
          <strong>💡 Como funciona:</strong><br/>
          • O anúncio aparece como pop-up quando o usuário recarrega a página<br/>
          • Pode ser usado para comunicados importantes, novidades ou avisos<br/>
          • O pop-up pode ser fechado pelo usuário e não aparecerá novamente na mesma sessão<br/>
          • Máximo de 500 caracteres para manter a legibilidade
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default AnnouncementManager; 