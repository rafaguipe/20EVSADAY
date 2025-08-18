import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const NovaSenha = () => {
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState('');

  const handleNovaSenha = async (e) => {
    e.preventDefault();
    setStatus('');
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setStatus('Erro ao atualizar senha: ' + error.message);
    } else {
      setStatus('Senha atualizada com sucesso! Faça login novamente.');
    }
  };

  return (
    <div>
      <h2>Definir nova senha</h2>
      <form onSubmit={handleNovaSenha}>
        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />
        <button type="submit">Salvar nova senha</button>
      </form>
      {status && <div>{status}</div>}
    </div>
  );
};

export default NovaSenha;
