import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const ProgressTitle = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: #1a1a1a;
  border: 2px solid #4a4a4a;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.percentage >= 100) return 'linear-gradient(90deg, #4a8a4a 0%, #6aaa6a 100%)';
    if (props.percentage >= 75) return 'linear-gradient(90deg, #4a6a8a 0%, #6a8aaa 100%)';
    if (props.percentage >= 50) return 'linear-gradient(90deg, #8a6a4a 0%, #aaa6a6a 100%)';
    return 'linear-gradient(90deg, #6a4a4a 0%, #8a6a6a 100%)';
  }};
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.5s ease, background 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    animation: ${props => props.percentage >= 100 ? 'shine 1s ease-in-out' : 'none'};
  }
`;

const ProgressText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 5px;
`;

const ProgressSubtext = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-align: center;
  text-transform: uppercase;
`;

const DailyProgressBar = ({ currentEVs, targetEVs = 20 }) => {
  const percentage = (currentEVs / targetEVs) * 100;
  const isComplete = currentEVs >= targetEVs;

  return (
    <ProgressContainer>
      <ProgressTitle>Meta Diária: 20 EVs</ProgressTitle>
      <ProgressBar>
        <ProgressFill percentage={percentage} />
      </ProgressBar>
      <ProgressText>
        {currentEVs}/{targetEVs} EVs ({percentage.toFixed(0)}%)
      </ProgressText>
      <ProgressSubtext>
        {isComplete ? '🎉 META ATINGIDA! 🎉' : `${targetEVs - currentEVs} EVs restantes`}
      </ProgressSubtext>
    </ProgressContainer>
  );
};

export default DailyProgressBar; 