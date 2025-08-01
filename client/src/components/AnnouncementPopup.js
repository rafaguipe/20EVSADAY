import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const PopupContainer = styled.div`
  background: #1a1a1a;
  border: 3px solid #4a6a8a;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { 
      transform: translateY(-50px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PopupTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #4a6a8a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: #4a6a8a;
    background: rgba(74, 106, 138, 0.1);
  }
`;

const PopupContent = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const PopupFooter = styled.div`
  margin-top: 24px;
  text-align: center;
`;

const DontShowAgainButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  background: none;
  border: 1px solid #666;
  color: #666;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #4a6a8a;
    color: #4a6a8a;
  }
`;

const AnnouncementPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAnnouncement();
  }, []);

  const checkAnnouncement = async () => {
    try {
      setLoading(true);
      
      // Verificar se o anúncio está ativo
      const { data: enabledData, error: enabledError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'announcement_enabled'
        });

      if (enabledError) {
        console.error('Erro ao verificar status do anúncio:', enabledError);
        return;
      }

      if (enabledData !== 'true') {
        return; // Anúncio desativado
      }

      // Verificar se já foi mostrado nesta sessão
      const hasShown = sessionStorage.getItem('announcement_shown');
      if (hasShown === 'true') {
        return; // Já foi mostrado
      }

      // Carregar texto do anúncio
      const { data: textData, error: textError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'announcement_text'
        });

      if (textError) {
        console.error('Erro ao carregar texto do anúncio:', textError);
        return;
      }

      if (textData && textData.trim()) {
        setAnnouncementText(textData);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Erro ao verificar anúncio:', error);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const dontShowAgain = () => {
    sessionStorage.setItem('announcement_shown', 'true');
    setShowPopup(false);
  };

  if (loading || !showPopup) {
    return null;
  }

  return (
    <Overlay onClick={closePopup}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <PopupHeader>
          <PopupTitle>📢 Anúncio</PopupTitle>
          <CloseButton onClick={closePopup}>×</CloseButton>
        </PopupHeader>
        
        <PopupContent>
          {announcementText}
        </PopupContent>
        
        <PopupFooter>
          <DontShowAgainButton onClick={dontShowAgain}>
            Não mostrar novamente nesta sessão
          </DontShowAgainButton>
        </PopupFooter>
      </PopupContainer>
    </Overlay>
  );
};

export default AnnouncementPopup; 