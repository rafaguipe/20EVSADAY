import React from 'react';
import styled from 'styled-components';
import { useDMNotification } from '../contexts/DMNotificationContext';

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DMNotification = styled.div`
  background: #9C27B0;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  border: 2px solid #7B1FA2;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  max-width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const NotificationTitle = styled.span`
  font-weight: bold;
  color: #E1BEE7;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #E1BEE7;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: white;
  }
`;

const NotificationMessage = styled.div`
  color: #F3E5F5;
  line-height: 1.4;
  word-wrap: break-word;
`;

const DMNotificationIndicator = () => {
  const { lastDMNotification, clearNotification } = useDMNotification();

  if (!lastDMNotification) return null;

  return (
    <NotificationContainer>
      <DMNotification>
        <NotificationHeader>
          <NotificationTitle>💬 Nova DM</NotificationTitle>
          <CloseButton onClick={clearNotification}>✕</CloseButton>
        </NotificationHeader>
        <NotificationMessage>
          {lastDMNotification.message.length > 50 
            ? `${lastDMNotification.message.substring(0, 50)}...`
            : lastDMNotification.message
          }
        </NotificationMessage>
      </DMNotification>
    </NotificationContainer>
  );
};

export default DMNotificationIndicator;
