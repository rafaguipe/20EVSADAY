import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

// Obter URL do Supabase
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://mbxefiadqcrzqbrfkvxu.supabase.co';

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

    // Verificar se estamos em um safelink do Outlook e extrair o link real
    const currentUrl = window.location.href;
    if (currentUrl.includes('safelinks.protection.outlook.com')) {
      console.log('Detectado safelink do Outlook, extraindo link real...');
      const urlParams = new URLSearchParams(window.location.search);
      const realUrl = urlParams.get('url');
      
      if (realUrl) {
        console.log('Link real encontrado:', realUrl);
        // Decodificar o URL
        const decodedUrl = decodeURIComponent(realUrl);
        console.log('Link decodificado:', decodedUrl);
        // Redirecionar para o link real
        window.location.href = decodedUrl;
        return; // Não continuar, aguardar o redirecionamento
      }
    }

    // Verificar tanto hash fragments quanto query parameters
    // O Supabase pode usar ambos dependendo de como o link é acessado
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);
    
    // Tentar obter do hash primeiro (formato padrão do Supabase)
    let accessToken = hashParams.get('access_token');
    let type = hashParams.get('type');
    
    // Se não estiver no hash, tentar query parameters (pode acontecer com safelinks do Outlook)
    if (!accessToken) {
      // O Supabase também pode usar ?token=... em vez de #access_token=...
      const token = queryParams.get('token');
      type = queryParams.get('type') || type;
      
      if (token && type === 'recovery') {
        // Se temos um token como query param, precisamos processá-lo manualmente
        console.log('Token encontrado como query parameter, processando...');
        // O Supabase processará automaticamente quando chamarmos getSession
      }
    }

    console.log('URL completa:', window.location.href);
    console.log('Hash:', hash);
    console.log('Query params:', window.location.search);
    console.log('Type:', type);
    console.log('Access Token presente:', !!accessToken);

    // Verificar se temos pelo menos um indicador de recovery
    const hasRecoveryToken = accessToken || queryParams.get('token');
    const isRecoveryType = type === 'recovery';

    if (!isRecoveryType && !hasRecoveryToken) {
      // Não há token de recuperação na URL
      console.log('Sem token de recuperação válido na URL');
      console.log('Hash params:', Object.fromEntries(hashParams));
      console.log('Query params:', Object.fromEntries(queryParams));
      setValidating(false);
      setIsValidLink(false);
      toast.error('Link inválido ou expirado. Verifique se a URL de redirecionamento está configurada no Supabase.');
      timeoutId = setTimeout(() => navigate('/forgot-password'), 3000);
      return;
    }

    // Usar onAuthStateChange para detectar quando o Supabase processa o recovery link
    subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
        // O Supabase processou o link de recuperação
        if (session && session.user) {
          setIsValidLink(true);
          setValidating(false);
          // Limpar o hash e query params da URL para segurança
          window.history.replaceState(null, '', window.location.pathname);
          toast.success('Link válido! Defina sua nova senha.');
        } else {
          setIsValidLink(false);
          setValidating(false);
          toast.error('Link inválido ou expirado');
          timeoutId = setTimeout(() => navigate('/forgot-password'), 3000);
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Verificar se estamos em um contexto de recovery
        const currentHash = window.location.hash;
        const currentSearch = window.location.search;
        if (currentHash.includes('type=recovery') || currentSearch.includes('type=recovery') || currentSearch.includes('token=')) {
          setIsValidLink(true);
          setValidating(false);
          window.history.replaceState(null, '', window.location.pathname);
          toast.success('Link válido! Defina sua nova senha.');
        }
      }
    });

    // Verificar sessão atual após um pequeno delay (para dar tempo do Supabase processar)
    const checkSession = async () => {
      // Aguardar um pouco mais para dar tempo do Supabase processar, especialmente com safelinks
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Se temos um token como query param, o Supabase precisa processá-lo primeiro
      // O token precisa ser verificado pelo endpoint /auth/v1/verify do Supabase
      const token = queryParams.get('token');
      if (token && type === 'recovery' && !accessToken) {
        console.log('Token encontrado como query parameter');
        console.log('Token:', token.substring(0, 20) + '...');
        
        // O token precisa ser verificado pelo Supabase primeiro
        // Vamos redirecionar para o endpoint de verificação do Supabase
        const verifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=recovery&redirect_to=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
        
        console.log('Redirecionando para endpoint de verificação do Supabase:', verifyUrl);
        window.location.href = verifyUrl;
        return; // Não continuar, aguardar o redirecionamento
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        // Não falhar imediatamente - pode ser que o Supabase ainda esteja processando
        console.log('Aguardando processamento do Supabase...');
      }

      if (session && session.user) {
        // Já há uma sessão válida (o link foi processado)
        setIsValidLink(true);
        setValidating(false);
        window.history.replaceState(null, '', window.location.pathname);
        toast.success('Link válido! Defina sua nova senha.');
      } else {
        // Aguardar mais um pouco para o onAuthStateChange processar
        // Aumentar o timeout para dar mais tempo, especialmente com safelinks do Outlook
        timeoutId = setTimeout(() => {
          if (!isValidLink) {
            console.log('Timeout aguardando processamento do link');
            setIsValidLink(false);
            setValidating(false);
            toast.error('Link inválido ou expirado. Solicite um novo link.');
            setTimeout(() => navigate('/forgot-password'), 2000);
          }
        }, 8000); // Aumentado para 8 segundos para dar tempo ao safelink processar
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
            • Problema com safelink do Outlook<br/>
            <br/>
            <strong>Se estiver usando Outlook:</strong><br/>
            1. No e-mail, clique com botão direito no link<br/>
            2. Selecione "Copiar endereço do link"<br/>
            3. Cole em um editor de texto<br/>
            4. Procure por "url=" e copie o link após esse parâmetro<br/>
            5. Decodifique o link (remova %3A, %2F, etc.)<br/>
            6. Acesse o link decodificado diretamente<br/>
            <br/>
            Ou solicite um novo link de recuperação.
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

