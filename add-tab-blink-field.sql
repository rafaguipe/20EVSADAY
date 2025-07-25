-- Adicionar campo para controlar piscar da aba
ALTER TABLE profiles 
ADD COLUMN tab_blink_enabled BOOLEAN DEFAULT true;

-- Comentário explicativo
COMMENT ON COLUMN profiles.tab_blink_enabled IS 'Controla se a aba do navegador deve piscar quando o timer do EV acabar'; 