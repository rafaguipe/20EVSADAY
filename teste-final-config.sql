-- Script de teste final para verificar configurações
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela system_settings existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'system_settings'
) as system_settings_exists;

-- 2. Verificar estrutura da tabela system_settings
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'system_settings'
ORDER BY ordinal_position;

-- 3. Verificar todas as configurações existentes
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
ORDER BY setting_key;

-- 4. Verificar especificamente as configurações da aba Sobre
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key IN (
    'sobre_gpc_text',
    'sobre_liderare_text',
    'sobre_visible',
    'loja_visible',
    'multimidia_visible',
    'chat_visible',
    'badges_visible',
    'leaderboard_visible',
    'loja_products'
)
ORDER BY setting_key;

-- 5. Contar quantas configurações foram criadas
SELECT 
    COUNT(*) as total_configuracoes,
    COUNT(CASE WHEN setting_key LIKE 'sobre_%' THEN 1 END) as configs_sobre,
    COUNT(CASE WHEN setting_key LIKE '%_visible' THEN 1 END) as configs_visibilidade,
    COUNT(CASE WHEN setting_key = 'loja_products' THEN 1 END) as configs_loja
FROM system_settings; 