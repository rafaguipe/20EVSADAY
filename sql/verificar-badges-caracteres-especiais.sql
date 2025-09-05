-- Verificar badges com caracteres especiais
-- Execute este script no Supabase SQL Editor

-- 1. Listar todas as badges com caracteres especiais
SELECT 
  'Badges com caracteres especiais' as status,
  id,
  name,
  description,
  icon
FROM badges 
WHERE name ~ '[áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]'
ORDER BY name;

-- 2. Verificar badges específicas mencionadas no erro
SELECT 
  'Verificando badges específicas' as status,
  CASE 
    WHEN EXISTS(SELECT 1 FROM badges WHERE name = 'Fundador') THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as badge_fundador,
  CASE 
    WHEN EXISTS(SELECT 1 FROM badges WHERE name = 'Líder 4 Anos de Fundação') THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as badge_lider_4_anos;

-- 3. Buscar badges similares
SELECT 
  'Badges similares encontradas' as status,
  id,
  name,
  description
FROM badges 
WHERE name ILIKE '%fundador%' 
   OR name ILIKE '%lider%'
   OR name ILIKE '%anos%'
ORDER BY name;

-- 4. Contar total de badges
SELECT 
  'Total de badges no sistema' as status,
  COUNT(*) as total_badges
FROM badges;

-- 5. Listar todas as badges para referência
SELECT 
  'Todas as badges disponíveis' as status,
  id,
  name,
  description,
  icon
FROM badges 
ORDER BY name;

-- 6. Verificar se há problemas de encoding
SELECT 
  'Verificando encoding das badges' as status,
  name,
  length(name) as tamanho_nome,
  encode(name::bytea, 'hex') as nome_hex
FROM badges 
WHERE name ~ '[áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]'
LIMIT 5;
