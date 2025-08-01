-- Script para configurar sistema de anúncios
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela system_settings existe
SELECT 
    'Tabela system_settings existe?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'system_settings'
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta;

-- 2. Configurar sistema de anúncios
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('announcement_enabled', 'false', 'Controla se o anúncio pop-up está ativo')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('announcement_text', '', 'Texto do anúncio pop-up')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 3. Verificar configurações criadas
SELECT 
    'Configurações de anúncio criadas:' as status,
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key IN ('announcement_enabled', 'announcement_text')
ORDER BY setting_key;

-- 4. Resumo final
SELECT 
    'SISTEMA DE ANÚNCIOS CONFIGURADO' as status,
    'Configurações de anúncio foram criadas com sucesso!' as mensagem,
    'Agora você pode gerenciar anúncios na aba Dev' as proximo_passo; 