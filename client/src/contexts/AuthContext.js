import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configurar axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verificar token ao carregar
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/verify');
          setUser(response.data.user);
        } catch (error) {
          console.error('Token inválido:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password, nickname, avatar_id) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        nickname,
        avatar_id
      });
      
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('Conta criada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar conta';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logout realizado com sucesso!');
  };

  const updateAvatar = async (avatar_id) => {
    try {
      await axios.put('/api/auth/avatar', { avatar_id });
      setUser(prev => ({ ...prev, avatar_id }));
      toast.success('Avatar atualizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao atualizar avatar';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateAvatar,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 