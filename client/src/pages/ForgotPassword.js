import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  
  &:hover {
    color: #6a6a6a;
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setError(error.message);
        toast.error('Erro ao enviar e-mail: ' + error.message);
      } else {
        setSuccess(true);
        toast.success('📧 E-mail enviado! Verifique sua caixa de entrada.');
      }
    } catch (err) {
      setError('Erro inesperado ao enviar e-mail');
      toast.error('Erro inesperado ao enviar e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Esqueci minha senha</Title>
        
        <InfoBox>
          <InfoText>
            📧 Digite seu e-mail e tentaremos enviar um link para redefinir sua senha.<br/>
            ⚠️ Se não receber o e-mail, entre em contato com o administrador.
          </InfoText>
        </InfoBox>
        
        {success ? (
          <SuccessMessage>
            ✅ Solicitação enviada!<br/>
            {window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') 
              ? '⚠️ Em desenvolvimento local, o e-mail pode não ser enviado. Entre em contato com o administrador.'
              : 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha. Se não receber o e-mail em alguns minutos, entre em contato com o administrador.'}
          </SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </SubmitButton>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
        )}
        
        <LinkText>
          Lembrou sua senha?
          <StyledLink to="/login">Fazer login</StyledLink>
        </LinkText>
        
        <LinkText>
          Não tem uma conta?
          <StyledLink to="/register">Faça o cadastro</StyledLink>
        </LinkText>
      </FormCard>
    </Container>
  );
};

export default ForgotPassword;

