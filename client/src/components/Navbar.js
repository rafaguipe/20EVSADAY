import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #4a4a4a;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  
  &:hover {
    transform: scale(1.02);
    transition: all 0.3s ease;
  }
`;

const LogoImage = styled.img`
  height: 50px;
  width: auto;
  
  @media (max-width: 768px) {
    height: 40px;
  }
`;



const LogoText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: ${props => props.active ? '#ffffff' : '#6a6a6a'};
  text-decoration: none;
  text-transform: uppercase;
  padding: 10px 15px;
  border: 2px solid ${props => props.active ? '#4a4a4a' : 'transparent'};
  background: ${props => props.active ? 'rgba(74, 74, 74, 0.3)' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffffff;
    border-color: #4a4a4a;
    background: rgba(74, 74, 74, 0.3);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: #4a4a4a;
  border: 2px solid #6a6a6a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const Username = styled.span`
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
`;

const LogoutBtn = styled.button`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px 16px;
  border: 2px solid #6a2a2a;
  background: #8a4a4a;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover {
    background: #aa6a6a;
    border-color: #8a4a4a;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const AuthBtn = styled(Link)`
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px 16px;
  border: 2px solid #4a4a4a;
  background: #1a1a1a;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover {
    background: #4a4a4a;
    border-color: #6a6a6a;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuBtn = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
`;

const MobileMenuContent = styled.div`
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #4a4a4a;
  display: ${props => props.open ? 'flex' : 'none'};
  flex-direction: column;
  padding: 20px;
  gap: 15px;
`;

const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Extrair o emoji do avatar_url
  const getAvatarEmoji = () => {
    if (!profile?.avatar_url) return avatars[0];
    const match = profile.avatar_url.match(/avatar_(\d+)\.png/);
    const idx = match ? parseInt(match[1], 10) - 1 : 0;
    return avatars[idx] || avatars[0];
  };

  return (
    <Nav>
              <LogoContainer to="/">
          <LogoImage src="/assets/logo_jogos_evolutivos.png" alt="Logo" />
          <LogoText>#20EVSADAY</LogoText>
        </LogoContainer>
      
      {isAuthenticated ? (
        <>
          <NavLinks>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink to="/leaderboard" active={isActive('/leaderboard')}>
              Ranking
            </NavLink>
            <NavLink to="/badges" active={isActive('/badges')}>
              Badges
            </NavLink>
            <NavLink to="/profile" active={isActive('/profile')}>
              Perfil
            </NavLink>
            <NavLink to="/multimidia" active={isActive('/multimidia')}>
              Multimídia
            </NavLink>
          </NavLinks>
          
          <UserSection>
            <UserInfo>
              <Avatar>{getAvatarEmoji()}</Avatar>
              <Username>{profile?.username || user?.email}</Username>
            </UserInfo>
            <LogoutBtn onClick={handleLogout}>Sair</LogoutBtn>
          </UserSection>
          
          <MobileMenu>
            <MobileMenuBtn onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              ☰
            </MobileMenuBtn>
            <MobileMenuContent open={mobileMenuOpen}>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>
                Dashboard
              </NavLink>
              <NavLink to="/leaderboard" active={isActive('/leaderboard')}>
                Ranking
              </NavLink>
              <NavLink to="/badges" active={isActive('/badges')}>
                Badges
              </NavLink>
              <NavLink to="/profile" active={isActive('/profile')}>
                Perfil
              </NavLink>
              <NavLink to="/multimidia" active={isActive('/multimidia')}>
                Multimídia
              </NavLink>
              <LogoutBtn onClick={handleLogout}>Sair</LogoutBtn>
            </MobileMenuContent>
          </MobileMenu>
        </>
      ) : (
        <AuthButtons>
          <AuthBtn to="/login">Entrar</AuthBtn>
          <AuthBtn to="/register">Cadastrar</AuthBtn>
        </AuthButtons>
      )}
    </Nav>
  );
};

export default Navbar; 