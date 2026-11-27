import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';
import { useEVTimer } from '../contexts/EVTimerContext';
import OfflineIndicator from './OfflineIndicator';

const Nav = styled.nav`
 position:fixed; inset:0 0 auto; height:80px; z-index:1000; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 20px; background:#fff; color:#183c37; border-bottom:1px solid #dce8e3; font-family:system-ui,sans-serif;
`;
const LogoContainer = styled(Link)`display:flex; align-items:center; gap:8px; text-decoration:none; color:#183c37; font-weight:750; white-space:nowrap;`;
const LogoImage = styled.img`height:38px; width:auto;`;
const NavLinks = styled.div`display:flex; align-items:center; gap:4px; @media(max-width:1000px){display:none;}`;
const NavLink = styled(Link)`font:inherit; font-size:14px; font-weight:600; color:${p=>p.active?'#237e70':'#536b65'}; background:${p=>p.active?'#e5f2ed':'transparent'}; text-decoration:none; padding:10px; border-radius:10px; &:hover{background:#e5f2ed;}`;
const UserSection = styled.div`display:flex; align-items:center; gap:12px;`;
const UserInfo = styled.div`display:flex; align-items:center; gap:8px; @media(max-width:1000px){display:none;}`;
const Avatar = styled.div`background:#e5f2ed; border-radius:50%; padding:8px;`;
const Username = styled.span`font-size:14px; font-weight:600;`;
const LogoutBtn = styled.button`font:inherit; border:1px solid #b8cdc5; border-radius:10px; background:white; color:#237e70; padding:9px 14px; cursor:pointer;`;
const AuthButtons = styled.div`display:flex; gap:8px;`;
const AuthBtn = styled(NavLink)`border:1px solid #b8cdc5;`;
const MobileMenu = styled.div`display:none; @media(max-width:1000px){display:block;}`;
const MobileMenuBtn = styled.button`font:inherit; background:white; color:#237e70; border:1px solid #b8cdc5; border-radius:10px; padding:9px; cursor:pointer;`;
const MobileMenuContent = styled.div`position:absolute; top:80px; right:0; left:0; background:white; border-bottom:1px solid #dce8e3; display:${p=>p.open?'flex':'none'}; flex-direction:column; padding:16px; gap:6px;`;
const BottomNav = styled.div`display:none; @media(max-width:1000px){display:grid; grid-template-columns:repeat(4,1fr); position:fixed; bottom:0; left:0; right:0; background:white; border-top:1px solid #dce8e3; padding:6px 4px calc(6px + env(safe-area-inset-bottom)); box-shadow:0 -4px 20px #183c3710; & a{text-align:center; font-size:12px; padding:8px 2px;}}`;
const avatars = [
  '👤', '👨', '👩', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👶'
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgesVisible, setBadgesVisible] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const { timer: evTimer, formatTime } = useEVTimer();

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

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all(['badges_visible', 'leaderboard_visible'].map(p_key =>
      supabase.rpc('get_system_setting', { p_key })
    )).then(([badges, ranking]) => {
      if (!badges.error) setBadgesVisible(badges.data === 'true');
      if (!ranking.error) setLeaderboardVisible(ranking.data === 'true');
    });
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Função para fechar o menu mobile quando um link é clicado
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
          <span>20 EVS a DAY</span>
        </LogoContainer>
      
      {isAuthenticated ? (
        <>
          <NavLinks>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Registro
            </NavLink>
            <NavLink to="/estatisticas" active={isActive('/estatisticas')}>
              Progresso
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
            
            
            
            <NavLink to="/sinaletica" active={isActive('/sinaletica')}>
              🌀 Sinalética
            </NavLink>
            
            
            <NavLink to="/profile" active={isActive('/profile')}>
              Perfil
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
                <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 10, color: '#6a6a6a', marginTop: 2 }}>
                  Próximo EV: {formatTime(evTimer)}
                </span>
              </div>
            </UserInfo>
            <LogoutBtn onClick={handleLogout}>Sair</LogoutBtn>
          </UserSection>
          
          <MobileMenu>
            <MobileMenuBtn aria-label="Mais opções" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              ☰
            </MobileMenuBtn>
            <MobileMenuContent open={mobileMenuOpen}>
              <NavLink to="/dashboard" active={isActive('/dashboard')} onClick={closeMobileMenu}>
                Registro
              </NavLink>
            <NavLink to="/estatisticas" active={isActive('/estatisticas')} onClick={closeMobileMenu}>Progresso</NavLink>
              {(isAdmin || leaderboardVisible) && (
                <NavLink to="/leaderboard" active={isActive('/leaderboard')} onClick={closeMobileMenu}>
                  Ranking
                </NavLink>
              )}
              {(isAdmin || badgesVisible) && (
                <NavLink to="/badges" active={isActive('/badges')} onClick={closeMobileMenu}>
                  Conquistas
                </NavLink>
              )}
              
              
              
              <NavLink to="/sinaletica" active={isActive('/sinaletica')} onClick={closeMobileMenu}>
                🌀 Sinalética
              </NavLink>
              
              
              <NavLink to="/profile" active={isActive('/profile')} onClick={closeMobileMenu}>
                Configurações
              </NavLink>
              {isAdmin && (
                <NavLink to="/dev" active={isActive('/dev')} onClick={closeMobileMenu}>
                  🔧 Dev
                </NavLink>
              )}
              <LogoutBtn onClick={() => { closeMobileMenu(); handleLogout(); }}>Sair</LogoutBtn>
            </MobileMenuContent>
          </MobileMenu>
          <BottomNav>{[['/dashboard','Registro'],['/estatisticas','Progresso'],['/sinaletica','Sinalética'],['/profile','Perfil']].map(([path,label]) => <NavLink key={path} to={path} active={isActive(path)} onClick={closeMobileMenu}>{label}</NavLink>)}</BottomNav>
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