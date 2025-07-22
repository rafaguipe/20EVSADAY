import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
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
  max-width: 500px;
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

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const AvatarOption = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid ${props => props.selected ? '#4a6a8a' : '#4a4a4a'};
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6a6a6a;
    transform: scale(1.05);
  }
`;

const SubmitButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 15px;
  border: 2px solid #4a4a4a;
  background: #2a6a2a;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
  
  &:hover {
    background: #4a8a4a;
    border-color: #6aaa6a;
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

const ErrorMessage = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ff6b6b;
  text-align: center;
  margin-top: 10px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalBox = styled.div`
  background: #1a1a1a;
  border: 3px solid #4a6a8a;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 30px rgba(74, 106, 138, 0.3);
`;

const ModalTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #4a6a8a;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const ModalMessage = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  line-height: 1.6;
  margin-bottom: 25px;
`;

const ModalIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const ModalButton = styled.button`
  font-family: 'Press Start 2P', monospace;
  padding: 12px 24px;
  background: #4a6a8a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
  
  &:hover {
    background: #357a6a;
  }
`;

const EmailWarning = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
`;

const WarningText = styled.p`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffc107;
  text-align: center;
  margin: 0;
`;

const avatars = ['😀', '😎', '🤖', '👾', '🐱', '🦊', '🐼', '🦁', '🐯', '🐸', '🐙', '🦄'];

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    avatar_id: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarSelect = (avatarId) => {
    setFormData({
      ...formData,
      avatar_id: avatarId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.nickname.length < 3) {
      setError('O apelido deve ter pelo menos 3 caracteres');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.email,
      formData.password,
      formData.nickname,
      formData.avatar_id
    );
    
    if (result.success) {
      setRegisteredEmail(formData.email);
      setShowEmailModal(true);
      toast.success('Conta criada com sucesso! Verifique seu e-mail.');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleModalClose = () => {
    setShowEmailModal(false);
    navigate('/login');
  };

  return (
    <>
      <Container>
        <FormCard>
          <Title>Cadastro</Title>
          
          <EmailWarning>
            <WarningText>
              ⚠️ IMPORTANTE: Após o cadastro, você receberá um e-mail de confirmação. 
              Clique no link para ativar sua conta!
            </WarningText>
          </EmailWarning>
          
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
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                required
                placeholder="Seu apelido"
                maxLength={20}
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
                minLength={6}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </FormGroup>
            
            <AvatarSection>
              <Label>Escolha seu Avatar</Label>
              <AvatarGrid>
                {avatars.map((avatar, index) => (
                  <AvatarOption
                    key={index}
                    selected={formData.avatar_id === index + 1}
                    onClick={() => handleAvatarSelect(index + 1)}
                  >
                    {avatar}
                  </AvatarOption>
                ))}
              </AvatarGrid>
            </AvatarSection>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </SubmitButton>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
          
          <LinkText>
            Já tem uma conta?
            <StyledLink to="/login">Faça login</StyledLink>
          </LinkText>
        </FormCard>
      </Container>

      {showEmailModal && (
        <ModalOverlay>
          <ModalBox>
            <ModalIcon>📧</ModalIcon>
            <ModalTitle>Verifique seu E-mail!</ModalTitle>
            <ModalMessage>
              Enviamos um link de confirmação para:<br />
              <strong style={{ color: '#4a6a8a' }}>{registeredEmail}</strong><br /><br />
              
              <span style={{ color: '#ffc107' }}>
                ⚠️ IMPORTANTE: Você precisa clicar no link do e-mail para ativar sua conta antes de fazer login!
              </span><br /><br />
              
              Verifique sua caixa de entrada e pasta de spam.
            </ModalMessage>
            <ModalButton onClick={handleModalClose}>
              Entendi, vou verificar!
            </ModalButton>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
};

export default Register; 