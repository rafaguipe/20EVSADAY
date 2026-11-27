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

let initialRecoveryUrl = window.location.pathname === '/reset-password' ? new URL(window.location.href) : null;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const navigate = useNavigate();
  const recoveryPromise = useRef(null);

  useEffect(() => {
    let mounted = true;
    if (!recoveryPromise.current) {
      recoveryPromise.current = (async () => {
        const url = initialRecoveryUrl || new URL(window.location.href);
        initialRecoveryUrl = null;
        const query = url.searchParams;
        const hash = new URLSearchParams(url.hash.slice(1));
        const type = query.get('type') || hash.get('type');
        if (query.has('error') || hash.has('error') ||
            query.has('error_description') || hash.has('error_description')) return false;
        const tokenHash = query.get('token_hash') || (type === 'recovery' ? query.get('token') : null);
        if (tokenHash && type === 'recovery') {
          const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
          return !error && Boolean(data.session?.user);
        }
        if (type === 'recovery' && hash.get('access_token') && hash.get('refresh_token')) {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session?.access_token === hash.get('access_token')) return true;
          const result = await supabase.auth.setSession({
            access_token: hash.get('access_token'),
            refresh_token: hash.get('refresh_token')
          });
          return !result.error && Boolean(result.data.session?.user);
        }
        return false;
      })().catch(() => false);
    }
    recoveryPromise.current.then(valid => {
      if (!mounted) return;
      setIsValidLink(valid);
      setValidating(false);
      window.history.replaceState(null, '', window.location.pathname);
    });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidLink || loading || success) return;
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
        await supabase.auth.signOut({ scope: 'local' });
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
