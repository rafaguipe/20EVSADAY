import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: #2a2a2a;
  border: 2px solid #4a4a4a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 15px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const TextEditorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditorCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 15px;
`;

const EditorTitle = styled.h4`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TextArea = styled.textarea`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  border-radius: 4px;
  width: 100%;
  min-height: 200px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4a8a4a;
  }
`;

const Button = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px 12px;
  border: 2px solid #4a8a4a;
  background: ${props => props.loading ? '#2a4a2a' : '#4a8a4a'};
  color: #ffffff;
  border-radius: 4px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-right: 8px;
  margin-bottom: 8px;

  &:hover:not(:disabled) {
    background: #6aaa6a;
    border-color: #6aaa6a;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const StatusText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${props => props.success ? '#4CAF50' : props.error ? '#FF9800' : '#6a6a6a'};
  margin-top: 10px;
`;

const InfoBox = styled.div`
  background: rgba(74, 106, 138, 0.1);
  border: 1px solid #4a6a8a;
  border-radius: 6px;
  padding: 10px;
  margin-top: 15px;
`;

const InfoText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #4a6a8a;
  margin: 0;
  line-height: 1.4;
`;

const SobreTextEditor = () => {
  const [gpcText, setGpcText] = useState('');
  const [liderareText, setLiderareText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);
      
      // Carregar texto sobre GPC
      const { data: gpcData, error: gpcError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'sobre_gpc_text'
        });

      if (gpcError) {
        console.error('Erro ao carregar texto GPC:', gpcError);
      } else {
        setGpcText(gpcData || '');
      }

      // Carregar texto sobre Liderare
      const { data: liderareData, error: liderareError } = await supabase
        .rpc('get_system_setting', {
          p_key: 'sobre_liderare_text'
        });

      if (liderareError) {
        console.error('Erro ao carregar texto Liderare:', liderareError);
      } else {
        setLiderareText(liderareData || '');
      }

    } catch (error) {
      console.error('Erro ao carregar textos:', error);
      toast.error('Erro ao carregar textos');
    } finally {
      setLoading(false);
    }
  };

  const saveTexts = async () => {
    try {
      setSaving(true);
      setStatus('');

      // Salvar texto GPC
      const { error: gpcError } = await supabase
        .rpc('set_system_setting', {
          p_key: 'sobre_gpc_text',
          p_value: gpcText,
          p_description: 'Texto sobre GPC Jogos Evolutivos na aba Sobre'
        });

      if (gpcError) {
        console.error('Erro ao salvar texto GPC:', gpcError);
        setStatus('❌ Erro ao salvar texto GPC');
        toast.error('Erro ao salvar texto GPC');
        return;
      }

      // Salvar texto Liderare
      const { error: liderareError } = await supabase
        .rpc('set_system_setting', {
          p_key: 'sobre_liderare_text',
          p_value: liderareText,
          p_description: 'Texto sobre IC Liderare na aba Sobre'
        });

      if (liderareError) {
        console.error('Erro ao salvar texto Liderare:', liderareError);
        setStatus('❌ Erro ao salvar texto Liderare');
        toast.error('Erro ao salvar texto Liderare');
        return;
      }

      setStatus('✅ Textos salvos com sucesso!');
      toast.success('Textos salvos com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar textos:', error);
      setStatus('❌ Erro ao salvar textos');
      toast.error('Erro ao salvar textos');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!window.confirm('Tem certeza que deseja restaurar os textos padrão?')) {
      return;
    }

    setGpcText(`GPC Jogos Evolutivos é uma iniciativa dedicada ao desenvolvimento de jogos que promovem a evolução da consciência através da ludologia interassistencial.

Nossos jogos são desenvolvidos com base nos princípios da Conscienciologia, buscando integrar diversão e autopesquisa de forma harmoniosa.

Através de mecânicas inovadoras e conteúdos educativos, proporcionamos experiências únicas que estimulam o desenvolvimento pessoal e a expansão da consciência.`);

    setLiderareText(`IC Liderare é uma Instituição Conscienciológica dedicada ao estudo e aplicação dos princípios da Conscienciologia.

Nossa missão é promover a evolução da consciência através de pesquisas, cursos, workshops e atividades que estimulem o autoconhecimento e o desenvolvimento pessoal.

Com uma equipe de pesquisadores e voluntários comprometidos, trabalhamos para disseminar o conhecimento conscienciológico e contribuir para a evolução da humanidade.`);

    toast.success('Textos restaurados para o padrão');
  };

  if (loading) {
    return (
      <Container>
        <Title>📝 Editor de Textos da Aba Sobre</Title>
        <Description>Carregando textos...</Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📝 Editor de Textos da Aba Sobre</Title>
      <Description>
        Edite os textos que aparecem na aba "Sobre" para todos os usuários. Use quebras de linha para formatar o texto.
      </Description>

      <TextEditorGrid>
        <EditorCard>
          <EditorTitle>🎮 GPC Jogos Evolutivos</EditorTitle>
          <TextArea
            placeholder="Digite aqui o texto sobre GPC Jogos Evolutivos..."
            value={gpcText}
            onChange={(e) => setGpcText(e.target.value)}
          />
        </EditorCard>

        <EditorCard>
          <EditorTitle>🏛️ IC Liderare</EditorTitle>
          <TextArea
            placeholder="Digite aqui o texto sobre IC Liderare..."
            value={liderareText}
            onChange={(e) => setLiderareText(e.target.value)}
          />
        </EditorCard>
      </TextEditorGrid>

      <div>
        <Button onClick={saveTexts} disabled={saving}>
          {saving ? '💾 Salvando...' : '💾 Salvar Textos'}
        </Button>
        <Button onClick={resetToDefault} disabled={saving}>
          🔄 Restaurar Padrão
        </Button>
      </div>

      {status && (
        <StatusText 
          success={status.includes('✅')}
          error={status.includes('❌')}
        >
          {status}
        </StatusText>
      )}

      <InfoBox>
        <InfoText>
          <strong>Como usar:</strong><br />
          • Edite os textos nos campos acima<br />
          • Use quebras de linha (Enter) para formatar<br />
          • Clique em "Salvar Textos" para aplicar as mudanças<br />
          • "Restaurar Padrão" volta aos textos iniciais<br />
          • Mudanças são aplicadas imediatamente na aba Sobre
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default SobreTextEditor; 