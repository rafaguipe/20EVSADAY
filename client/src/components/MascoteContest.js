import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const ContestContainer = styled.div`
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid #4a4a4a;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 15px;
    margin: 15px 0;
  }
`;

const ContestTitle = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 15px;
  }
`;

const ContestDescription = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 9px;
    margin-bottom: 15px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const NameInput = styled.input`
  flex: 1;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  padding: 12px 16px;
  border: 2px solid #4a4a4a;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 8px;
  outline: none;
  
  &:focus {
    border-color: #6a6a6a;
  }
  
  &::placeholder {
    color: #6a6a6a;
  }
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 10px 14px;
  }
`;

const SubmitButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 12px 20px;
  border: 2px solid #4a8a4a;
  background: #4a8a4a;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #6aaa6a;
    border-color: #6aaa6a;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    font-size: 9px;
    padding: 10px 16px;
  }
`;

const SuggestionsList = styled.div`
  margin-top: 20px;
`;

const ListTitle = styled.h4`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 12px;
  }
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
  }
`;

const SuggestionItem = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #ffffff;
  
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 8px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
  padding: 20px;
  
  @media (max-width: 768px) {
    font-size: 9px;
    padding: 15px;
  }
`;

const MascoteContest = () => {
  const { user } = useAuth();
  const [suggestedName, setSuggestedName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mascote_suggestions')
        .select('name')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar sugestões:', error);
        toast.error('Erro ao carregar sugestões');
      } else {
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      toast.error('Erro ao carregar sugestões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestedName.trim()) {
      toast.error('Digite um nome para o mascote');
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('mascote_suggestions')
        .insert([
          {
            name: suggestedName.trim(),
            user_id: user.id,
            username: user.user_metadata?.username || 'Anônimo'
          }
        ]);

      if (error) {
        console.error('Erro ao enviar sugestão:', error);
        toast.error('Erro ao enviar sugestão');
      } else {
        toast.success('Nome enviado com sucesso!');
        setSuggestedName('');
        // Recarregar a lista
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      toast.error('Erro ao enviar sugestão');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ContestContainer>
      <ContestTitle>🎯 Concurso: Nome do Mascote</ContestTitle>
      <ContestDescription>
        Sugira um nome para o nosso mascote até dia 15/9/2025. 
        Depois faremos uma votação!
      </ContestDescription>
      
      <form onSubmit={handleSubmit}>
        <InputGroup>
          <NameInput
            type="text"
            placeholder="Digite o nome do mascote..."
            value={suggestedName}
            onChange={(e) => setSuggestedName(e.target.value)}
            maxLength={30}
            disabled={submitting}
          />
          <SubmitButton type="submit" disabled={submitting || !suggestedName.trim()}>
            {submitting ? 'Enviando...' : 'Enviar'}
          </SubmitButton>
        </InputGroup>
      </form>

      <SuggestionsList>
        <ListTitle>Nomes Sugeridos ({suggestions.length})</ListTitle>
        
        {loading ? (
          <EmptyState>Carregando...</EmptyState>
        ) : suggestions.length > 0 ? (
          <SuggestionsGrid>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem key={index}>
                {suggestion.name}
              </SuggestionItem>
            ))}
          </SuggestionsGrid>
        ) : (
          <EmptyState>Nenhuma sugestão ainda. Seja o primeiro!</EmptyState>
        )}
      </SuggestionsList>
    </ContestContainer>
  );
};

export default MascoteContest;
