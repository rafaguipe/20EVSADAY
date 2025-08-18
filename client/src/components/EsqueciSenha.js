import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/nova-senha'
    });
    if (error) {
      setStatus('Erro ao enviar e-mail: ' + error.message);
    } else {
      setStatus('Verifique seu e-mail para redefinir a senha.');
    }
  };

  return (
    <div>
      <h2>Esqueci minha senha</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar link de redefinição</button>
      </form>
      {status && <div>{status}</div>}
    </div>
  );
};

export default EsqueciSenha;
