import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme.background};

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 18px;
  }

  @media (max-width: 480px) {
    padding: 14px;
  }
`;

export const CardTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 12px;
  }
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

export const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: #4a4a4a;
  border: 3px solid #6a6a6a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }
`;

export const UserInfo = styled.div`
  flex: 1;
`;

export const Username = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const Email = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #6a6a6a;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

export const AvatarSection = styled.div`
  margin-top: 20px;
`;

export const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 15px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
`;

export const AvatarOption = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid ${props => props.selected ? '#4a6a8a' : '#4a4a4a'};
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;

  &:hover {
    border-color: #6a6a6a;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 26px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

export const StatCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  backdrop-filter: blur(10px);

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

export const StatValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #6a6a6a;
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 7px;
  }
`;

export const HistoryChart = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  margin-top: 20px;

  @media (max-width: 480px) {
    padding: 14px;
    margin-top: 14px;
  }
`;

export const ChartTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const ChartBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    margin-bottom: 8px;
  }
`;

export const ChartLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  width: 80px;
  min-width: 80px;

  @media (max-width: 480px) {
    font-size: 8px;
    width: 60px;
    min-width: 60px;
  }
`;

export const ChartBarFill = styled.div`
  height: 20px;
  background: #4a6a8a;
  border-radius: 4px;
  margin: 0 10px;
  min-width: 20px;
  transition: width 0.3s ease;

  @media (max-width: 480px) {
    height: 16px;
    margin: 0 6px;
  }
`;

export const ChartValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  min-width: 60px;
  text-align: right;

  @media (max-width: 480px) {
    font-size: 8px;
    min-width: 40px;
  }
`;

export const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #6a6a6a;
  text-align: center;
  padding: 40px;

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 24px;
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

export const ToggleLabel = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  cursor: pointer;
  flex-shrink: 0;
`;

export const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #8a4a4a;
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

  ${({ checked }) => checked && `
    background-color: #4a8a4a;

    &:before {
      transform: translateX(26px);
    }
  `}
`;

export const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

export const ToggleStatus = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${({ enabled }) => enabled ? '#4a8a4a' : '#8a4a4a'};
  margin-left: 8px;

  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

export const ExportSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(74, 106, 138, 0.1);
  border: 2px solid #4a6a8a;
  border-radius: 8px;

  @media (max-width: 480px) {
    margin-top: 14px;
    padding: 14px;
  }
`;

export const ExportTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #4a6a8a;
  margin-bottom: 15px;
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

export const ExportButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  padding: 12px 20px;
  border: 2px solid ${({ variant }) => {
    if (variant === 'txt') return '#ffc107';
    if (variant === 'csv') return '#28a745';
    return '#4a6a8a';
  }};
  background: ${({ variant }) => {
    if (variant === 'txt') return 'rgba(255, 193, 7, 0.1)';
    if (variant === 'csv') return 'rgba(40, 167, 69, 0.1)';
    return 'rgba(74, 106, 138, 0.1)';
  }};
  color: ${({ variant }) => {
    if (variant === 'txt') return '#ffc107';
    if (variant === 'csv') return '#28a745';
    return '#4a6a8a';
  }};
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;

  &:hover {
    background: ${({ variant }) => {
      if (variant === 'txt') return '#ffc107';
      if (variant === 'csv') return '#28a745';
      return '#4a6a8a';
    }};
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 10px 14px;
  }
`;

export const ExportInfo = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  margin-top: 15px;
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

export const TelegramSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(74, 106, 138, 0.1);
  border: 2px solid #4a6a8a;
  border-radius: 8px;

  @media (max-width: 480px) {
    margin-top: 14px;
    padding: 14px;
  }
`;

export const TelegramText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  line-height: 1.5;
  margin: 0 0 12px;

  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

export const TelegramCode = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  background: rgba(26, 26, 26, 0.9);
  border: 2px dashed #4a6a8a;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 10px;
  }
`;

export const TelegramButtonRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const TelegramButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 10px 16px;
  border-radius: 6px;
  border: 2px solid #4a6a8a;
  background: rgba(74, 106, 138, 0.15);
  color: #4a6a8a;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;

  &:hover {
    background: #4a6a8a;
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    font-size: 9px;
    padding: 8px 12px;
  }
`;
