import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    max-width: 90%;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
    max-width: 95%;
    border-radius: 14px;
  }
`;

const Title = styled.h1`
  font-family: system-ui, sans-serif;
  font-size: 24px;
  color: #183c37;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 20px;
  }
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
  min-height: 48px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px;
  }
  
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
  min-height: 48px;
  min-width: 48px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px;
    width: 100%;
  }
  
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
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  margin-left: 5px;
  
  &:hover {
    color: #6a6a6a;
  }
`;

const ErrorMessage = styled.div`
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #ff6b6b;
  text-align: center;
  margin-top: 10px;
`;

const ResendButton = styled.button`
  padding: 8px 16px;
  border-radius: 14px;
  border: 2px solid #237e70;
  background: transparent;
  color: #237e70;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 6px 10px;
    width: 100%;
  }
  
  &:hover {
    background: rgba(74, 106, 138, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmailInfo = styled.div`
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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      });
      
      if (error) {
        toast.error('Erro ao reenviar confirmação: ' + error.message);
      } else {
        toast.success('E-mail de confirmação reenviado! Verifique sua caixa de entrada.');
      }
    } catch (err) {
      toast.error('Erro inesperado ao reenviar confirmação');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResendButton(false);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      if (result.error.message.includes('Email not confirmed')) {
        setShowResendButton(true);
        toast.error('❌ E-mail não confirmado! Verifique sua caixa de entrada ou clique em "Reenviar confirmação".');
      }
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <FormCard>
        <Title>Login</Title>
        
        <EmailInfo>
          <InfoText>
            📧 Primeira vez? Faça o cadastro primeiro e confirme seu e-mail!
          </InfoText>
        </EmailInfo>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </SubmitButton>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          {showResendButton && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <ResendButton
                onClick={handleResendConfirmation}
                disabled={loading}
              >
                📧 Reenviar Confirmação
              </ResendButton>
            </div>
          )}
        </Form>
        
        <LinkText>
          Não tem uma conta?
          <StyledLink to="/register">Faça o cadastro</StyledLink>
        </LinkText>
        
        <LinkText>
          Esqueceu sua senha?
          <StyledLink to="/forgot-password">Recuperar senha</StyledLink>
        </LinkText>
      </FormCard>
    </Container>
  );
};

export default Login; 