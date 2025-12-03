import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import Dev from './pages/Dev';
import Estatisticas from './pages/Estatisticas';
import LoadingSpinner from './components/LoadingSpinner';
import Multimidia from './pages/Multimidia';
import ChatEV from './pages/ChatEV';
import Loja from './pages/Loja';
import VotacaoMascote from './pages/VotacaoMascote';

import { supabase } from './supabaseClient';
import AnnouncementPopup from './components/AnnouncementPopup';
// Pop-up do próximo marco - COMENTADO: estava sobrepondo elementos no celular
// Vamos usar o componente EVSMilestoneProgress na Home page em vez do pop-up
// import EVSMilestoneTracker from './components/EVSMilestoneTracker';
import { DMNotificationProvider } from './contexts/DMNotificationContext';
import DMNotificationIndicator from './components/DMNotificationIndicator';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para rotas de administrador
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(profile?.is_admin || false);
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    if (isAuthenticated) {
      checkAdminStatus();
    } else {
      setChecking(false);
    }
  }, [user, isAuthenticated]);

  if (loading || checking) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s, color 0.3s;
  }
`;

function App() {
  const { loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <DMNotificationProvider>
        <div className="App">
          <Navbar />
          <AnnouncementPopup />
          {/* Pop-up do próximo marco - COMENTADO: estava sobrepondo elementos no celular */}
          {/* <EVSMilestoneTracker /> */}
          {/* EVSMilestoneProgress agora está na Home page */}
          <DMNotificationIndicator />
          <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/badges" 
                element={
                  <ProtectedRoute>
                    <Badges />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/estatisticas" 
                element={
                  <ProtectedRoute>
                    <Estatisticas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatEV />
                  </ProtectedRoute>
                } 
              />
              <Route path="/loja" element={<Loja />} />
              <Route 
                path="/votacao-mascote" 
                element={
                  <ProtectedRoute>
                    <VotacaoMascote />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/dev" 
                element={
                  <AdminRoute>
                    <Dev />
                  </AdminRoute>
                } 
              />
              <Route path="/multimidia" element={<Multimidia />} />
            </Routes>
          </main>
        </div>
      </DMNotificationProvider>
    </StyledThemeProvider>
  );
}

export default App; 