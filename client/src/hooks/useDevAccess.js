import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export const useDevAccess = () => {
  const { user } = useAuth();
  const [hasDevAccess, setHasDevAccess] = useState(false);

  useEffect(() => {
    const checkDevAccess = () => {
      // Lógica para verificar acesso Dev (mesma do menu Dev existente)
      const devUsers = ['rafaguipe'];
      const hasAccess = devUsers.includes(user?.username);
      setHasDevAccess(hasAccess);
    };

    if (user) {
      checkDevAccess();
    }
  }, [user]);

  return hasDevAccess;
};
