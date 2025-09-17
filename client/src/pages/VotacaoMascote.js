import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1a1a1a;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #00ff88;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
`;

const Subtitle = styled.p`
  color: #ccc;
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.2rem;
`;

const VotingCard = styled.div`
  background: #2a2a2a;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  border: 2px solid #333;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const OptionButton = styled.button`
  background: ${props => props.selected ? '#00ff88' : '#333'};
  color: ${props => props.selected ? '#000' : '#fff'};
  border: 2px solid ${props => props.selected ? '#00ff88' : '#555'};
  border-radius: 10px;
  padding: 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    background: ${props => props.selected ? '#00ff88' : '#444'};
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background: #00ff88;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover:not(:disabled) {
    background: #00cc6a;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsCard = styled.div`
  background: #2a2a2a;
  border-radius: 15px;
  padding: 30px;
  border: 2px solid #00ff88;
`;

const ThankYouMessage = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const ThankYouTitle = styled.h2`
  color: #00ff88;
  font-size: 2rem;
  margin-bottom: 15px;
`;

const ThankYouText = styled.p`
  color: #ccc;
  font-size: 1.1rem;
`;

const ResultsTitle = styled.h3`
  color: #00ff88;
  margin-bottom: 20px;
  text-align: center;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #333;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid ${props => props.rank <= 3 ? '#00ff88' : '#555'};
`;

const ResultName = styled.span`
  color: #fff;
  font-weight: ${props => props.rank <= 3 ? 'bold' : 'normal'};
`;

const ResultVotes = styled.span`
  color: #00ff88;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  background: #ff4444;
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const VotacaoMascote = () => {
  const { user } = useAuth();
  const [mascotOptions, setMascotOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [votingResults, setVotingResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadVotingData();
    }
  }, [user]);

  const loadVotingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar opções do mascote
      const { data: options, error: optionsError } = await supabase
        .from('mascot_options')
        .select('id, name')
        .order('name');

      if (optionsError) throw optionsError;

      setMascotOptions(options || []);

      // Verificar se usuário já votou
      const { data: voteCheck, error: voteError } = await supabase
        .rpc('user_has_voted');

      if (voteError) throw voteError;

      setHasVoted(voteCheck);

      // Se já votou, carregar o voto e resultados
      if (voteCheck) {
        const { data: userVoteData, error: userVoteError } = await supabase
          .rpc('get_user_vote');

        if (userVoteError) throw userVoteError;

        setUserVote(userVoteData?.[0] || null);

        // Carregar resultados
        await loadResults();
      }

    } catch (err) {
      console.error('Erro ao carregar dados da votação:', err);
      setError('Erro ao carregar dados da votação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      const { data: results, error: resultsError } = await supabase
        .rpc('get_mascot_voting_results');

      if (resultsError) throw resultsError;

      setVotingResults(results || []);
    } catch (err) {
      console.error('Erro ao carregar resultados:', err);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !user) return;

    try {
      setSubmitting(true);
      setError(null);

      // Inserir voto
      const { error: voteError } = await supabase
        .from('mascot_votes')
        .insert({
          user_id: user.id,
          mascot_option_id: selectedOption
        });

      if (voteError) throw voteError;

      toast.success('Voto registrado com sucesso! 🎉');
      
      // Recarregar dados
      await loadVotingData();

    } catch (err) {
      console.error('Erro ao votar:', err);
      setError('Erro ao registrar voto. Tente novamente.');
      toast.error('Erro ao registrar voto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <ErrorMessage>
          Você precisa estar logado para participar da votação.
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🗳️ Votação do Mascote</Title>
      <Subtitle>
        Escolha o nome para o mascote do #20EVSADAY!
      </Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {hasVoted ? (
        <ResultsCard>
          <ThankYouMessage>
            <ThankYouTitle>🎉 Obrigado por votar!</ThankYouTitle>
            <ThankYouText>
              Seu voto foi registrado com sucesso.
              {userVote && (
                <><br />Você votou em: <strong>{userVote.mascot_name}</strong></>
              )}
            </ThankYouText>
          </ThankYouMessage>

          <ResultsTitle>📊 Resultados da Votação</ResultsTitle>
          <ResultsList>
            {votingResults.slice(0, 10).map((result, index) => (
              <ResultItem key={result.mascot_name} rank={index + 1}>
                <ResultName rank={index + 1}>
                  {index + 1}º {result.mascot_name}
                </ResultName>
                <ResultVotes>
                  {result.vote_count} voto{result.vote_count !== 1 ? 's' : ''} 
                  ({result.percentage}%)
                </ResultVotes>
              </ResultItem>
            ))}
          </ResultsList>
        </ResultsCard>
      ) : (
        <VotingCard>
          <h3 style={{ color: '#00ff88', marginBottom: '20px', textAlign: 'center' }}>
            Escolha seu favorito:
          </h3>
          
          <OptionsGrid>
            {mascotOptions.map((option) => (
              <OptionButton
                key={option.id}
                selected={selectedOption === option.id}
                onClick={() => setSelectedOption(option.id)}
              >
                {option.name}
              </OptionButton>
            ))}
          </OptionsGrid>

          <SubmitButton
            onClick={handleVote}
            disabled={!selectedOption || submitting}
          >
            {submitting ? 'Registrando voto...' : '🗳️ Votar'}
          </SubmitButton>
        </VotingCard>
      )}
    </Container>
  );
};

export default VotacaoMascote;
