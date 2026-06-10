import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  @media (max-width: 480px) { padding: 24px; }
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
  @media (max-width: 480px) { font-size: 18px; }
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
  &:hover:not(:disabled) {
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

const Message = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: ${props => props.$error ? '#ff6b6b' : '#4CAF50'};
  text-align: center;
  margin-top: 10px;
  line-height: 1.6;
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

const LinkText = styled.div`
  text-align: center;
  margin-top: 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #6a6a6a;
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  margin-left: 5px;
  &:hover { color: #6a6a6a; }
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
  const processedRef = useRef(false);

  useEffect(() => {
    let authSub;
    let fallbackTimer;
    let mounted = true;

    const handleRecovery = async () => {
      try {
        // 1. Extrair parametros da URL (hash ou query)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(window.location.search);

        const type = hashParams.get('type') || queryParams.get('type');
        const token = hashParams.get('access_token') || hashParams.get('token')
          || queryParams.get('access_token') || queryParams.get('token');
        const errorDesc = queryParams.get('error_description');

        console.log('[ResetPassword] type:', type, 'hasToken:', !!token, 'error:', errorDesc);

        if (errorDesc) {
          console.log('[ResetPassword] Link com erro:', errorDesc);
          if (!mounted) return;
          setValidating(false);
          setIsValidLink(false);
          toast.error('Link invalido ou expirado.');
          fallbackTimer = setTimeout(() => navigate('/forgot-password'), 4000);
          return;
        }

        // 2. Verificar se ja existe sessao ativa
        const { data: { session }, error: sessError } = await supabase.auth.getSession();
        if (sessError) console.error('[ResetPassword] Erro ao obter sessao:', sessError);

        if (session?.user) {
          console.log('[ResetPassword] Sessao ativa encontrada:', session.user.email);
          if (!mounted) return;
          setIsValidLink(true);
          setValidating(false);
          window.history.replaceState(null, '', window.location.pathname);
          toast.success('Link valido! Defina sua nova senha.');
          return;
        }

        // 3. Se tem token, trocar por sessao via verifyOtp
        if (token) {
          console.log('[ResetPassword] Tentando verifyOtp com token...');
          const { data, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery',
          });

          if (otpError) {
            console.error('[ResetPassword] verifyOtp falhou:', otpError.message);

            // Fallback: escutar onAuthStateChange (caso o Supabase processe async)
            console.log('[ResetPassword] Escutando onAuthStateChange...');
            const { data: subData } = supabase.auth.onAuthStateChange((event, newSession) => {
              console.log('[ResetPassword] Auth event:', event, newSession?.user?.email);
              if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
                  && newSession?.user && !processedRef.current) {
                processedRef.current = true;
                if (!mounted) return;
                setIsValidLink(true);
                setValidating(false);
                window.history.replaceState(null, '', window.location.pathname);
                toast.success('Link valido! Defina sua nova senha.');
              }
            });
            authSub = subData.subscription;

            // Timeout de 15s
            fallbackTimer = setTimeout(() => {
              if (!processedRef.current) {
                console.log('[ResetPassword] Timeout - token expirado ou invalido');
                if (!mounted) return;
                setValidating(false);
                setIsValidLink(false);
                toast.error('Link expirado. Solicite um novo.');
                setTimeout(() => navigate('/forgot-password'), 4000);
              }
            }, 15000);
          } else {
            console.log('[ResetPassword] verifyOtp sucesso!');
            if (!mounted) return;
            setIsValidLink(true);
            setValidating(false);
            window.history.replaceState(null, '', window.location.pathname);
            toast.success('Link valido! Defina sua nova senha.');
          }
        } else {
          // Sem token e sem sessao
          console.log('[ResetPassword] Sem token nem sessao');
          if (!mounted) return;
          setValidating(false);
          setIsValidLink(false);
          toast.error('Link invalido ou expirado.');
          fallbackTimer = setTimeout(() => navigate('/forgot-password'), 4000);
        }
      } catch (err) {
        console.error('[ResetPassword] Erro inesperado:', err);
        if (!mounted) return;
        setValidating(false);
        setIsValidLink(false);
        toast.error('Erro ao processar link.');
        fallbackTimer = setTimeout(() => navigate('/forgot-password'), 4000);
      }
    };

    handleRecovery();

    return () => {
      mounted = false;
      if (authSub) authSub.unsubscribe();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        toast.error('Erro ao atualizar senha: ' + error.message);
      } else {
        setSuccess(true);
        toast.success('Senha atualizada com sucesso!');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError('Erro inesperado ao atualizar senha');
      toast.error('Erro inesperado ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Container>
        <FormCard>
          <Title>Validando Link...</Title>
          <InfoBox><InfoText>Processando link de recuperacao...</InfoText></InfoBox>
        </FormCard>
      </Container>
    );
  }

  if (!isValidLink) {
    return (
      <Container>
        <FormCard>
          <Title>Link Invalido</Title>
          <InfoBox>
            <InfoText>
              Link invalido ou expirado.<br/><br/>
              Solicite um novo link de recuperacao.
            </InfoText>
          </InfoBox>
          <LinkText>
            <StyledLink to="/forgot-password">Voltar</StyledLink>
          </LinkText>
        </FormCard>
      </Container>
    );
  }

  return (
    <Container>
      <FormCard>
        <Title>Nova Senha</Title>
        <InfoBox><InfoText>Digite sua nova senha abaixo.</InfoText></InfoBox>

        {success ? (
          <Message>Senha atualizada com sucesso!<br/>Redirecionando para o login...</Message>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">Nova Senha</Label>
              <Input type="password" id="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                placeholder="Minimo 6 caracteres" minLength={6} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input type="password" id="confirmPassword" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required
                placeholder="Digite novamente" minLength={6} />
            </FormGroup>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </SubmitButton>
            {error && <Message $error>{error}</Message>}
          </Form>
        )}

        <LinkText>
          <StyledLink to="/login">Fazer login</StyledLink>
        </LinkText>
      </FormCard>
    </Container>
  );
};

export default ResetPassword;
