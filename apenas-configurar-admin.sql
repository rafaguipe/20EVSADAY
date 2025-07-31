-- Script para apenas configurar admin (sem testar função)
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar se a tabela profiles existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 3. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 5. Limpar duplicados (método simples)
DELETE FROM profiles 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM profiles 
    GROUP BY user_id
);

-- 6. Garantir que o usuário atual seja admin
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id = auth.uid();

-- 7. Se o usuário não existir, criar
INSERT INTO profiles (user_id, is_admin, created_at, updated_at)
SELECT 
    auth.uid(),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid()
);

-- 8. Verificar resultado final
SELECT 
    'Status final:' as status,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 9. Adicionar constraint única
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Constraint única adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Constraint única já existe';
    END IF;
END $$;

-- 10. Verificar constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 11. Resumo final
SELECT 
    'CONFIGURAÇÃO CONCLUÍDA' as status,
    'Você agora é administrador e pode usar a função set_system_setting' as mensagem; 