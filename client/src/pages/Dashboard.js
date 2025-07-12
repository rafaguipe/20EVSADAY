import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const CardTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  text-transform: uppercase;
`;

// Input component removed as it's not being used

const TextArea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  padding: 12px;
  border: 2px solid #4a4a4a;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 14px;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #6a6a6a;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }
`;

const ScoreButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const ScoreButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  padding: 15px 10px;
  border: 2px solid #4a4a4a;
  background: ${props => props.selected ? '#4a6a8a' : '#1a1a1a'};
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.selected ? '#6a8aaa' : '#4a4a4a'};
    border-color: #6a6a6a;
  }
`;

const SubmitButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 15px;
  border: 2px solid #4a4a4a;
  background: #2a6a2a;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
  
  &:hover {
    background: #4a8a4a;
    border-color: #6aaa6a;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #4a4a4a;
    border-color: #6a6a6a;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-transform: uppercase;
`;

const RecentEVs = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const EVItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #4a4a4a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EVInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const EVScore = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  font-weight: bold;
`;

const EVDate = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
`;

const EVNotes = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Dashboard = () => {
  const [formData, setFormData] = useState({
    score: null,
    notes: ''
  });
  const [stats, setStats] = useState(null);
  const [recentEVs, setRecentEVs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadRecentEVs();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/evs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadRecentEVs = async () => {
    try {
      const response = await axios.get('/api/evs/my?limit=10');
      setRecentEVs(response.data.evs);
    } catch (error) {
      console.error('Erro ao carregar EVs recentes:', error);
    }
  };

  const handleScoreSelect = (score) => {
    setFormData({
      ...formData,
      score
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.score === null) {
      toast.error('Selecione uma pontuação!');
      return;
    }

    setLoading(true);
    
    try {
      await axios.post('/api/evs', {
        score: formData.score,
        notes: formData.notes
      });
      
      toast.success('EV registrado com sucesso!');
      
      setFormData({
        score: null,
        notes: ''
      });
      
      loadStats();
      loadRecentEVs();
    } catch (error) {
      toast.error('Erro ao registrar EV');
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Title>Dashboard</Title>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{stats?.general?.total_evs || 0}</StatValue>
          <StatLabel>Total de EVs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats?.general?.average_score || 0}</StatValue>
          <StatLabel>Média Geral</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats?.general?.max_score || 0}</StatValue>
          <StatLabel>Pontuação Máxima</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats?.today?.evs || 0}</StatValue>
          <StatLabel>EVs Hoje</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats?.today?.points || 0}</StatValue>
          <StatLabel>Pontos Hoje</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats?.week?.evs || 0}</StatValue>
          <StatLabel>EVs na Semana</StatLabel>
        </StatCard>
      </StatsGrid>

      <Grid>
        <Card>
          <CardTitle>Registrar Novo EV</CardTitle>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Pontuação (0-4)</Label>
              <ScoreButtons>
                {[0, 1, 2, 3, 4].map(score => (
                  <ScoreButton
                    key={score}
                    type="button"
                    selected={formData.score === score}
                    onClick={() => handleScoreSelect(score)}
                  >
                    {score}
                  </ScoreButton>
                ))}
              </ScoreButtons>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <TextArea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Descreva sua experiência..."
                maxLength={500}
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar EV'}
            </SubmitButton>
          </Form>
        </Card>

        <RecentEVs>
          <CardTitle>EVs Recentes</CardTitle>
          {recentEVs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6a6a6a', padding: '20px' }}>
              Nenhum EV registrado ainda
            </div>
          ) : (
            recentEVs.map(ev => (
              <EVItem key={ev.id}>
                <EVInfo>
                  <EVScore>EV {ev.score}</EVScore>
                  <EVDate>{formatDate(ev.created_at)}</EVDate>
                  {ev.notes && <EVNotes>{ev.notes}</EVNotes>}
                </EVInfo>
              </EVItem>
            ))
          )}
        </RecentEVs>
      </Grid>
    </Container>
  );
};

export default Dashboard; 