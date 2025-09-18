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
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotes, setUserVotes] = useState([]);
  const [voteStatus, setVoteStatus] = useState(null);
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

      // Verificar status de voto do usuário
      const { data: voteStatusData, error: voteStatusError } = await supabase
        .rpc('check_user_vote_status', { user_uuid: user.id });

      if (voteStatusError) throw voteStatusError;

      const status = voteStatusData?.[0];
      setVoteStatus(status);
      setHasVoted(status?.has_voted || false);

      // Se já votou, carregar os votos e resultados
      if (status?.has_voted) {
        const { data: userVotesData, error: userVotesError } = await supabase
          .rpc('get_user_votes', { user_uuid: user.id });

        if (userVotesError) throw userVotesError;

        setUserVotes(userVotesData || []);

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

  const handleOptionToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      // Remover da seleção
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
    } else {
      // Adicionar à seleção (máximo 3)
      if (selectedOptions.length < 3) {
        setSelectedOptions(prev => [...prev, optionId]);
      } else {
        toast.error('Você pode escolher no máximo 3 opções!');
      }
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || !user) return;

    try {
      setSubmitting(true);
      setError(null);

      // Inserir todos os votos selecionados
      const votes = selectedOptions.map(optionId => ({
        user_id: user.id,
        mascot_option_id: optionId
      }));

      const { error: voteError } = await supabase
        .from('mascot_votes')
        .insert(votes);

      if (voteError) throw voteError;

      toast.success(`${selectedOptions.length} voto(s) registrado(s) com sucesso! 🎉`);
      
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
        Escolha 3 nomes para o mascote do #20EVSADAY!
      </Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {hasVoted ? (
        <ResultsCard>
          <ThankYouMessage>
            <ThankYouTitle>🎉 Obrigado por votar!</ThankYouTitle>
            <ThankYouText>
              Seus {userVotes.length} voto(s) foram registrados com sucesso.
              {userVotes.length > 0 && (
                <><br />Você votou em: <strong>{userVotes.map(v => v.mascot_name).join(', ')}</strong></>
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
            Escolha até 3 opções ({selectedOptions.length}/3):
          </h3>
          
          {voteStatus && (
            <div style={{ 
              color: '#ccc', 
              textAlign: 'center', 
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {voteStatus.has_voted ? (
                `Você já votou ${voteStatus.vote_count} vez(es). ${voteStatus.remaining_votes} voto(s) restante(s).`
              ) : (
                'Você ainda não votou. Escolha até 3 opções!'
              )}
            </div>
          )}
          
          <OptionsGrid>
            {mascotOptions.map((option) => (
              <OptionButton
                key={option.id}
                selected={selectedOptions.includes(option.id)}
                onClick={() => handleOptionToggle(option.id)}
                disabled={!selectedOptions.includes(option.id) && selectedOptions.length >= 3}
              >
                {option.name}
                {selectedOptions.includes(option.id) && ' ✓'}
              </OptionButton>
            ))}
          </OptionsGrid>

          <SubmitButton
            onClick={handleVote}
            disabled={selectedOptions.length === 0 || submitting}
          >
            {submitting ? 'Registrando voto(s)...' : `🗳️ Votar (${selectedOptions.length} opção${selectedOptions.length !== 1 ? 'ões' : ''})`}
          </SubmitButton>
        </VotingCard>
      )}
    </Container>
  );
};

export default VotacaoMascote;
