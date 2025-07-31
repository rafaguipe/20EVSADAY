-- Script final para configurar aba Sobre
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

-- 2. Configurações iniciais para a aba Sobre e controle de visibilidade das abas

-- Texto padrão sobre GPC Jogos Evolutivos
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('sobre_gpc_text', 
     'GPC Jogos Evolutivos é uma iniciativa dedicada ao desenvolvimento de jogos que promovem a evolução da consciência através da ludologia interassistencial.

Nossos jogos são desenvolvidos com base nos princípios da Conscienciologia, buscando integrar diversão e autopesquisa de forma harmoniosa.

Através de mecânicas inovadoras e conteúdos educativos, proporcionamos experiências únicas que estimulam o desenvolvimento pessoal e a expansão da consciência.',
     'Texto sobre GPC Jogos Evolutivos na aba Sobre')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Texto padrão sobre IC Liderare
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('sobre_liderare_text',
     'IC Liderare é uma Instituição Conscienciológica dedicada ao estudo e aplicação dos princípios da Conscienciologia.

Nossa missão é promover a evolução da consciência através de pesquisas, cursos, workshops e atividades que estimulem o autoconhecimento e o desenvolvimento pessoal.

Com uma equipe de pesquisadores e voluntários comprometidos, trabalhamos para disseminar o conhecimento conscienciológico e contribuir para a evolução da humanidade.',
     'Texto sobre IC Liderare na aba Sobre')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Configurações de visibilidade das abas (padrão: apenas admins veem Sobre e Loja)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('sobre_visible', 'false', 'Controla se a aba Sobre é visível para todos os usuários'),
    ('loja_visible', 'false', 'Controla se a aba Loja é visível para todos os usuários'),
    ('multimidia_visible', 'true', 'Controla se a aba Multimídia é visível para todos os usuários'),
    ('chat_visible', 'true', 'Controla se a aba Chat é visível para todos os usuários'),
    ('badges_visible', 'true', 'Controla se a aba Badges é visível para todos os usuários'),
    ('leaderboard_visible', 'true', 'Controla se a aba Ranking é visível para todos os usuários')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Produto inicial da loja (desativado por padrão)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('loja_products',
     '[{"id":1,"title":"Workshop Jogos Evolutivos","description":"Aprenda a fazer jogos evolutivos usando jogos eletrônicos. Workshop online sobre ludologia interassistencial.","thumbnail":"/assets/workshop26.7.2025.png","price":"Online","date":"26.07.2025","time":"9h00 às 12h00","link":"https://www.sympla.com.br/evento-online/workshop-jogos-evolutivos-jogos-eletronicos-online/2991500?_gl=1*1xmmzhj*_gcl_au*MjEzMzExMTg0OS4xNzQ5NDYyOTk2*_ga*OTI4NjI2MzcuMTcyMTQ0MjExMA..*_ga_KXH10SQTZF*czE3NTMyOTY4OTckbzkkZzEkdDE3NTMyOTc1NTQkajUzJGwwJGgxNTc2NzU3MzI2","active":false}]',
     'Lista de produtos da loja')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 3. Verificar as configurações criadas
SELECT 
    'Configurações criadas:' as status,
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

-- 4. Contar configurações criadas
SELECT 
    'Resumo:' as status,
    COUNT(*) as total_configuracoes,
    COUNT(CASE WHEN setting_key LIKE 'sobre_%' THEN 1 END) as configs_sobre,
    COUNT(CASE WHEN setting_key LIKE '%_visible' THEN 1 END) as configs_visibilidade,
    COUNT(CASE WHEN setting_key = 'loja_products' THEN 1 END) as configs_loja
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
);

-- 5. Resumo final
SELECT 
    'CONFIGURAÇÃO CONCLUÍDA' as status,
    'Todas as configurações da aba Sobre foram criadas com sucesso!' as mensagem,
    'Agora você pode testar a aplicação' as proximo_passo; 