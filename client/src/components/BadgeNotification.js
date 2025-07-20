import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100px);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  animation: ${props => props.show ? slideIn : slideOut} 0.5s ease-in-out;
`;

const BadgeCard = styled.div`
  background: linear-gradient(135deg, #2a4a6a 0%, #4a6a8a 100%);
  border: 3px solid #ffd700;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  text-align: center;
  min-width: 300px;
  backdrop-filter: blur(10px);
`;

const BadgeIcon = styled.div`
  font-size: 64px;
  margin-bottom: 15px;
  animation: bounce 1s ease-in-out;
`;

const BadgeTitle = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 10px;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const BadgeMessage = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffd700;
  text-transform: uppercase;
  margin-bottom: 15px;
`;

const BadgeDescription = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  opacity: 0.8;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const BadgeNotification = ({ badge, show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && badge) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for animation to finish
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, badge, onClose]);

  if (!show || !badge) return null;

  return (
    <NotificationContainer show={isVisible}>
      <BadgeCard>
        <CloseButton onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 500);
        }}>
          ×
        </CloseButton>
        
        <BadgeIcon>{badge.icon}</BadgeIcon>
        <BadgeTitle>{badge.name}</BadgeTitle>
        <BadgeMessage>🎉 BADGE CONQUISTADA! 🎉</BadgeMessage>
        <BadgeDescription>{badge.description}</BadgeDescription>
      </BadgeCard>
    </NotificationContainer>
  );
};

export default BadgeNotification; 