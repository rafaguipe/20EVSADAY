import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';
import { useEVTimer } from '../contexts/EVTimerContext';
import { useChatNotification } from '../contexts/ChatNotificationContext';
import { useDMNotification } from '../contexts/DMNotificationContext';
import OfflineIndicator from './OfflineIndicator';

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

const NavLinkContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  font-family: 'Press Start 2P', monospace;
  animation: ${props => props.count > 0 ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const DMNotificationBadge = styled(NotificationBadge)`
  background: #ffd700; /* Amarelo para DMs */
  color: #000; /* Texto preto para DMs */
`;

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgesVisible, setBadgesVisible] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [lojaVisible, setLojaVisible] = useState(true);
  const [sobreVisible, setSobreVisible] = useState(false);
  const [multimidiaVisible, setMultimidiaVisible] = useState(true);
  const [chatVisible, setChatVisible] = useState(true);
  const [votacaoVisible, setVotacaoVisible] = useState(false);
  const { timer: evTimer, formatTime } = useEVTimer();
  const { unreadCount } = useChatNotification();
  const { unreadDMs } = useDMNotification();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*') // Select all to get username, avatar_url, ev_interval_minutes, sound_enabled
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle for robust error handling

          if (error) {
            console.error('Erro detalhado ao carregar perfil:', error);
            return;
          }

          if (data) {
            setProfile(data);
            setIsAdmin(data.is_admin || false);
          } else {
            const nickname = user.user_metadata?.nickname || `Jogador ${user.id.slice(0, 8)}`;
            const avatar_id = user.user_metadata?.avatar_id || 1;

            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                username: nickname,
                full_name: nickname,
                avatar_url: `avatar_${avatar_id}.png`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('Erro ao criar perfil:', createError);
            } else {
              setProfile(newProfile);
            }
          }
        } catch (err) {
          console.error('Erro inesperado ao carregar perfil:', err);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Verificar visibilidade das abas
  useEffect(() => {
    const checkTabVisibility = async () => {
      if (!isAuthenticated) {
        setLojaVisible(false);
        setSobreVisible(false);
        setMultimidiaVisible(true);
        setChatVisible(true);
        setBadgesVisible(true);
        setLeaderboardVisible(true);
        setVotacaoVisible(false);
        return;
      }

      try {
        const tabs = [
          'loja_visible',
          'sobre_visible',
          'multimidia_visible',
          'chat_visible',
          'badges_visible',
          'leaderboard_visible',
          'votacao_visible'
        ];

        for (const tab of tabs) {
          const { data, error } = await supabase
            .rpc('get_system_setting', {
              p_key: tab
            });

          if (error) {
            console.error(`Erro ao verificar visibilidade da aba ${tab}:`, error);
            // Valores padrão
            if (tab === 'loja_visible') {
              setLojaVisible(false);
            } else if (tab === 'sobre_visible') {
              setSobreVisible(false);
            } else if (tab === 'multimidia_visible') {
              setMultimidiaVisible(true);
            } else if (tab === 'chat_visible') {
              setChatVisible(true);
            } else if (tab === 'badges_visible') {
              setBadgesVisible(true);
            } else if (tab === 'leaderboard_visible') {
              setLeaderboardVisible(true);
            } else if (tab === 'votacao_visible') {
              setVotacaoVisible(false);
            }
          } else {
            const isVisible = data === 'true';
            if (tab === 'loja_visible') {
              setLojaVisible(isVisible);
            } else if (tab === 'sobre_visible') {
              setSobreVisible(isVisible);
            } else if (tab === 'multimidia_visible') {
              setMultimidiaVisible(isVisible);
            } else if (tab === 'chat_visible') {
              setChatVisible(isVisible);
            } else if (tab === 'badges_visible') {
              setBadgesVisible(isVisible);
            } else if (tab === 'leaderboard_visible') {
              setLeaderboardVisible(isVisible);
            } else if (tab === 'votacao_visible') {
              setVotacaoVisible(isVisible);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar visibilidade das abas:', error);
        // Valores padrão em caso de erro
        setLojaVisible(false);
        setSobreVisible(false);
        setMultimidiaVisible(true);
        setChatVisible(true);
        setBadgesVisible(true);
        setLeaderboardVisible(true);
        setVotacaoVisible(false);
      }
    };

    checkTabVisibility();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Extrair o emoji do avatar_url
  const getAvatarEmoji = () => {
    if (!profile?.avatar_url) {
      return avatars[0];
    }
    const match = profile.avatar_url.match(/avatar_(\d+)\.png/);
    const idx = match ? parseInt(match[1], 10) - 1 : 0;
    return avatars[idx] || avatars[0];
  };

  return (
    <Nav>
              <LogoContainer to="/">
          <LogoImage src="/assets/boneco1.png" alt="Logo" />
          {/* <LogoText>#20EVSADAY</LogoText> */}
        </LogoContainer>
      
      {isAuthenticated ? (
        <>
          <NavLinks>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Registro
            </NavLink>
            {(isAdmin || leaderboardVisible) && (
              <NavLink to="/leaderboard" active={isActive('/leaderboard')}>
                Ranking
              </NavLink>
            )}
            {(isAdmin || badgesVisible) && (
              <NavLink to="/badges" active={isActive('/badges')}>
                Conquistas
              </NavLink>
            )}
            {(isAdmin || chatVisible) && (
              <NavLinkContainer>
                <NavLink to="/chat" active={isActive('/chat')}>
                  Chat
                </NavLink>
                {unreadCount > 0 && (
                  <NotificationBadge count={unreadCount}>
                    {unreadCount}
                  </NotificationBadge>
                )}
                {/* Indicador de DMs não lidas */}
                {unreadDMs > 0 && (
                  <DMNotificationBadge count={unreadDMs}>
                    {unreadDMs}
                  </DMNotificationBadge>
                )}
              </NavLinkContainer>
            )}
            {(isAdmin || lojaVisible) && (
              <NavLink to="/loja" active={isActive('/loja')}>
                Loja
              </NavLink>
            )}
            <NavLink to="/estatisticas" active={isActive('/estatisticas')}>
              Estatísticas
            </NavLink>
            {/* Link da votação temporariamente desativado */}
            {/* {(isAdmin || votacaoVisible) && (
              <NavLink to="/votacao-mascote" active={isActive('/votacao-mascote')}>
                🗳️ Votação
              </NavLink>
            )} */}
            {(isAdmin || multimidiaVisible) && (
              <NavLink to="/multimidia" active={isActive('/multimidia')}>
                Multimídia
              </NavLink>
            )}
            <NavLink to="/profile" active={isActive('/profile')}>
              Configurações
            </NavLink>
            {isAdmin && (
              <NavLink to="/dev" active={isActive('/dev')}>
                🔧 Dev
              </NavLink>
            )}
          </NavLinks>
          
          <UserSection>
            <OfflineIndicator />
            <UserInfo>
              <Avatar>{getAvatarEmoji()}</Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Username>{profile?.username || 'Carregando...'}</Username>
                <span style={{ fontFamily: 'Press Start 2P, monospace', fontSize: 10, color: '#6a6a6a', marginTop: 2 }}>
                  Próximo EV: {formatTime(evTimer)}
                </span>
              </div>
            </UserInfo>
            <LogoutBtn onClick={handleLogout}>Sair</LogoutBtn>
          </UserSection>
          
          <MobileMenu>
            <MobileMenuBtn onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              ☰
            </MobileMenuBtn>
            <MobileMenuContent open={mobileMenuOpen}>
                          <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Registro
            </NavLink>
            {(isAdmin || leaderboardVisible) && (
              <NavLink to="/leaderboard" active={isActive('/leaderboard')}>
                Ranking
              </NavLink>
            )}
            {(isAdmin || badgesVisible) && (
              <NavLink to="/badges" active={isActive('/badges')}>
                Conquistas
              </NavLink>
            )}
            {(isAdmin || chatVisible) && (
              <NavLinkContainer>
                <NavLink to="/chat" active={isActive('/chat')}>
                  Chat
                </NavLink>
                {unreadCount > 0 && (
                  <NotificationBadge count={unreadCount}>
                    {unreadCount}
                  </NotificationBadge>
                )}
                {/* Indicador de DMs não lidas */}
                {unreadDMs > 0 && (
                  <DMNotificationBadge count={unreadDMs}>
                    {unreadDMs}
                  </DMNotificationBadge>
                )}
              </NavLinkContainer>
            )}
            {(isAdmin || lojaVisible) && (
              <NavLink to="/loja" active={isActive('/loja')}>
                Loja
              </NavLink>
            )}
            <NavLink to="/estatisticas" active={isActive('/estatisticas')}>
              Estatísticas
            </NavLink>
            {/* Link da votação temporariamente desativado */}
            {/* {(isAdmin || votacaoVisible) && (
              <NavLink to="/votacao-mascote" active={isActive('/votacao-mascote')}>
                🗳️ Votação
              </NavLink>
            )} */}
            {(isAdmin || multimidiaVisible) && (
              <NavLink to="/multimidia" active={isActive('/multimidia')}>
                Multimídia
              </NavLink>
            )}
            <NavLink to="/profile" active={isActive('/profile')}>
              Configurações
            </NavLink>
              {isAdmin && (
                <NavLink to="/dev" active={isActive('/dev')}>
                  🔧 Dev
                </NavLink>
              )}
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