import React from 'react';
import styled from 'styled-components';
import { useSync } from '../contexts/SyncContext';

const OfflineContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${props => props.isOnline ? '#4a8a4a' : '#ff6b6b'};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? '#4a8a4a' : '#ff6b6b'};
  animation: ${props => !props.isOnline ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const PendingCount = styled.span`
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
`;

const SyncButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 6px 12px;
  background: ${props => props.isSyncing ? '#4a4a4a' : '#4a6a8a'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.isSyncing ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background: ${props => props.isSyncing ? '#4a4a4a' : '#357a6a'};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const OfflineIndicator = () => {
  const { isOnline, pendingEVs, isSyncing, manualSync } = useSync();

  return (
    <OfflineContainer>
      <StatusIndicator isOnline={isOnline}>
        <StatusDot isOnline={isOnline} />
        {isOnline ? 'Online' : 'Offline'}
      </StatusIndicator>
      
      {pendingEVs.length > 0 && (
        <>
          <PendingCount>{pendingEVs.length}</PendingCount>
          <SyncButton 
            onClick={manualSync} 
            disabled={!isOnline || isSyncing}
            isSyncing={isSyncing}
          >
            {isSyncing ? '🔄' : '🔄'} 
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </SyncButton>
        </>
      )}
    </OfflineContainer>
  );
};

export default OfflineIndicator; 