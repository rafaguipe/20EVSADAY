-- Script para ver apelidos e emails dos usuários
-- Execute este script no Supabase SQL Editor

-- Opção 1: Ver apenas os dados da tabela profiles (username)
SELECT 
  username as apelido,
  created_at as data_criacao,
  is_admin as administrador
FROM profiles 
ORDER BY created_at DESC;

-- Opção 2: Ver dados da tabela profiles com informações adicionais
SELECT 
  username as apelido,
  full_name as nome_completo,
  avatar_url as avatar,
  is_admin as administrador,
  created_at as data_criacao
FROM profiles 
ORDER BY created_at DESC;

-- Opção 3: Ver todos os usuários e seus status (recomendado)
SELECT 
  username as apelido,
  is_admin as administrador,
  created_at as data_criacao,
  CASE 
    WHEN is_admin = true THEN '👑 ADMIN'
    ELSE '👤 Usuário'
  END as tipo_usuario
FROM profiles 
ORDER BY is_admin DESC, created_at DESC;

-- Opção 4: Contagem de usuários por tipo
SELECT 
  CASE 
    WHEN is_admin = true THEN '👑 Administradores'
    ELSE '👤 Usuários Normais'
  END as tipo,
  COUNT(*) as quantidade
FROM profiles 
GROUP BY is_admin
ORDER BY is_admin DESC;

-- Opção 5: Ver apenas administradores
SELECT 
  username as apelido,
  created_at as data_criacao
FROM profiles 
WHERE is_admin = true
ORDER BY created_at DESC;

-- Opção 6: Ver apenas usuários normais
SELECT 
  username as apelido,
  created_at as data_criacao
FROM profiles 
WHERE is_admin = false
ORDER BY created_at DESC; 