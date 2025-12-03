import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
`;

const FormCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const Input = styled.input`
  font-family: 'Press Start 2P', monospace;
  padding: 12px;
  border: 2px solid #4a4a4a;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 14px;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #6a6a6a;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }
`;

const SubmitButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 15px;
  border: 2px solid #4a4a4a;
  background: #2a4a6a;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
  
  &:hover {
    background: #4a6a8a;
    border-color: #6a8aaa;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #4a4a4a;
    border-color: #6a6a6a;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #4CAF50;
  text-align: center;
  margin-top: 10px;
  line-height: 1.6;
`;

const ErrorMessage = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ff6b6b;
  text-align: center;
  margin-top: 10px;
`;

const InfoBox = styled.div`
  background: rgba(74, 106, 138, 0.1);
  border: 2px solid #4a6a8a;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #4a6a8a;
  text-align: center;
  margin: 0;
  line-height: 1.4;
`;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;
    let subscription;

    // Verificar se há hash na URL (o Supabase usa hash fragments)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    console.log('URL completa:', window.location.href);
    console.log('Hash:', hash);
    console.log('Type:', type);
    console.log('Access Token presente:', !!accessToken);

    if (!type || type !== 'recovery' || !accessToken) {
      // Não há token de recuperação na URL
      console.log('Sem token de recuperação válido na URL');
      console.log('Hash params:', Object.fromEntries(hashParams));
      setValidating(false);
      setIsValidLink(false);
      toast.error('Link inválido ou expirado. Verifique se a URL de redirecionamento está configurada no Supabase.');
      timeoutId = setTimeout(() => navigate('/forgot-password'), 3000);
      return;
    }

    // Usar onAuthStateChange para detectar quando o Supabase processa o recovery link
    subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'PASSWORD_RECOVERY') {
        // O Supabase processou o link de recuperação
        if (session && session.user) {
          setIsValidLink(true);
          setValidating(false);
          // Limpar o hash da URL para segurança
          window.history.replaceState(null, '', window.location.pathname);
          toast.success('Link válido! Defina sua nova senha.');
        } else {
          setIsValidLink(false);
          setValidating(false);
          toast.error('Link inválido ou expirado');
          timeoutId = setTimeout(() => navigate('/forgot-password'), 3000);
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Pode ser que o link já tenha sido processado
        const currentHash = window.location.hash;
        if (currentHash.includes('type=recovery')) {
          setIsValidLink(true);
          setValidating(false);
          window.history.replaceState(null, '', window.location.pathname);
          toast.success('Link válido! Defina sua nova senha.');
        }
      }
    });

    // Verificar sessão atual após um pequeno delay (para dar tempo do Supabase processar)
    const checkSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsValidLink(false);
        setValidating(false);
        toast.error('Erro ao processar link: ' + error.message);
        timeoutId = setTimeout(() => navigate('/forgot-password'), 3000);
        return;
      }

      if (session && session.user) {
        // Já há uma sessão válida (o link foi processado)
        setIsValidLink(true);
        setValidating(false);
        window.history.replaceState(null, '', window.location.pathname);
        toast.success('Link válido! Defina sua nova senha.');
      } else {
        // Aguardar mais um pouco para o onAuthStateChange processar
        timeoutId = setTimeout(() => {
          if (!isValidLink) {
            console.log('Timeout aguardando processamento do link');
            setIsValidLink(false);
            setValidating(false);
            toast.error('Link inválido ou expirado. Solicite um novo link.');
            setTimeout(() => navigate('/forgot-password'), 2000);
          }
        }, 5000);
      }
    };

    checkSession();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.data.subscription.unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate, isValidLink]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
        toast.error('Erro ao atualizar senha: ' + error.message);
      } else {
        setSuccess(true);
        toast.success('✅ Senha atualizada com sucesso!');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Erro inesperado ao atualizar senha');
      toast.error('Erro inesperado ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto valida o link
  if (validating) {
    return (
      <Container>
        <FormCard>
          <Title>Validando Link...</Title>
          <InfoBox>
            <InfoText>
              ⏳ Processando link de recuperação...
            </InfoText>
          </InfoBox>
        </FormCard>
      </Container>
    );
  }

  // Se o link não é válido, não mostrar o formulário
  if (!isValidLink) {
    return (
      <Container>
        <FormCard>
          <Title>Link Inválido</Title>
          <InfoBox>
          <InfoText>
            ❌ Link inválido ou expirado.<br/>
            <br/>
            💡 <strong>Possíveis causas:</strong><br/>
            • URL de redirecionamento não configurada no Supabase<br/>
            • Link expirado (válido por 1 hora)<br/>
            • Link já foi usado<br/>
            <br/>
            Solicite um novo link de recuperação.
          </InfoText>
          </InfoBox>
        </FormCard>
      </Container>
    );
  }

  return (
    <Container>
      <FormCard>
        <Title>Nova Senha</Title>
        
        <InfoBox>
          <InfoText>
            🔒 Digite sua nova senha abaixo.
          </InfoText>
        </InfoBox>
        
        {success ? (
          <SuccessMessage>
            ✅ Senha atualizada com sucesso!<br/>
            Redirecionando para o login...
          </SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Digite novamente"
                minLength={6}
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </SubmitButton>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
        )}
      </FormCard>
    </Container>
  );
};

export default ResetPassword;

