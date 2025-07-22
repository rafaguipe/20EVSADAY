import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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

  // Verificar sessão ao carregar
  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      if (session?.user) {
        await ensureProfileExists(session.user);
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        if (session?.user) {
          await ensureProfileExists(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função auxiliar para garantir que o perfil existe
  const ensureProfileExists = async (user) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    if (!profile) {
      const nickname = user.user_metadata?.nickname || `Jogador ${user.id.slice(0, 8)}`;
      const avatar_id = user.user_metadata?.avatar_id || 1;
      await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            username: nickname,
            full_name: nickname,
            avatar_url: `avatar_${avatar_id}.png`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password, nickname, avatar_id) => {
    try {
      // Registrar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
            avatar_id
          }
        }
      });

      if (error) throw error;

      // Inserir dados adicionais na tabela profiles
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id, // UUID do Supabase Auth
              username: nickname,
              full_name: nickname,
              avatar_url: `avatar_${avatar_id}.png`, // Assumindo que você tem avatars
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não falhar o registro se o perfil não for criado
        }
      }

      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Erro ao criar conta';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateAvatar = async (avatar_id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: `avatar_${avatar_id}.png`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Avatar atualizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Erro ao atualizar avatar';
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