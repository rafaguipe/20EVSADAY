-- Script para configurar sistema de marcos de EVS
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

-- 2. Configurar sistema de marcos de EVS
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('evs_milestones_enabled', 'true', 'Controla se o sistema de marcos de EVS está ativo')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('last_evs_milestone', '0', 'Último marco de EVS alcançado')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 3. Verificar configurações criadas
SELECT 
    'Configurações de marcos de EVS criadas:' as status,
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key IN ('evs_milestones_enabled', 'last_evs_milestone')
ORDER BY setting_key;

-- 4. Verificar total atual de EVS
SELECT 
    'Total atual de EVS:' as status,
    COUNT(*) as total_evs,
    FLOOR(COUNT(*) / 1000) * 1000 as ultimo_marco_alcancado,
    (FLOOR(COUNT(*) / 1000) + 1) * 1000 as proximo_marco
FROM evs;

-- 5. Resumo final
SELECT 
    'SISTEMA DE MARCOS DE EVS CONFIGURADO' as status,
    'Sistema de marcos de EVS foi configurado com sucesso!' as mensagem,
    'Os marcos serão celebrados automaticamente a cada 1000 EVS' as proximo_passo; 