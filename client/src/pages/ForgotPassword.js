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
  background: #f4f8f6;
`;

const FormCard = styled.div`
  background: #ffffff;
  border: 2px solid #dce8e3;
  border-radius: 14px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-family: system-ui, sans-serif;
  font-size: 24px;
  color: #183c37;
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
  font-family: system-ui, sans-serif;
  font-size: 12px;
  color: #183c37;
  text-transform: uppercase;
`;

const Input = styled.input`
  font-family: system-ui, sans-serif;
  padding: 12px;
  border: 2px solid #dce8e3;
  background: #f4f8f6;
  color: #183c37;
  font-size: 14px;
  border-radius: 14px;
  
  &:focus {
    outline: none;
    border-color: #536b65;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }
`;

const SubmitButton = styled.button`
  font-family: system-ui, sans-serif;
  font-size: 14px;
  padding: 15px;
  border: 2px solid #dce8e3;
  background: #237e70;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
  
  &:hover {
    background: #237e70;
    border-color: #237e70;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #dce8e3;
    border-color: #536b65;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.div`
  text-align: center;
  margin-top: 20px;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #536b65;
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
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #4CAF50;
  text-align: center;
  margin-top: 10px;
  line-height: 1.6;
`;

const ErrorMessage = styled.div`
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #ff6b6b;
  text-align: center;
  margin-top: 10px;
`;

const InfoBox = styled.div`
  background: rgba(74, 106, 138, 0.1);
  border: 2px solid #237e70;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #237e70;
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
      // URL de redirecionamento - deve estar configurada no Supabase
      const redirectUrl = `${window.location.origin}/reset-password`;


      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      if (error) {
        setError('Não foi possível solicitar a recuperação. Aguarde alguns minutos e tente novamente.');
        
      } else {
        setSuccess(true);
        toast.success('Solicitação recebida. Verifique seu e-mail.');
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
            Informe seu e-mail cadastrado para solicitar um link de recuperação.
          </InfoText>
        </InfoBox>
        
        {success ? (
          <SuccessMessage>
            ✅ Solicitação enviada!<br/>
            {window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') 
              ? '⚠️ Em desenvolvimento local, o e-mail pode não ser enviado. Entre em contato com o administrador.'
              : 'Se houver uma conta associada ao e-mail, você receberá instruções. Confira também a pasta de spam.'}
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

