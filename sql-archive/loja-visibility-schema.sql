-- Schema para controle de visibilidade da Loja
-- Execute no Supabase SQL Editor

-- Tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Função para obter configuração
CREATE OR REPLACE FUNCTION get_system_setting(p_key TEXT)
RETURNS TEXT AS $$
DECLARE
    v_value TEXT;
BEGIN
    SELECT setting_value INTO v_value
    FROM system_settings
    WHERE setting_key = p_key;
    
    RETURN COALESCE(v_value, 'false');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para definir configuração (apenas admins)
CREATE OR REPLACE FUNCTION set_system_setting(p_key TEXT, p_value TEXT, p_description TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se é admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Apenas administradores podem alterar configurações do sistema';
    END IF;
    
    -- Inserir ou atualizar configuração
    INSERT INTO system_settings (setting_key, setting_value, description)
    VALUES (p_key, p_value, p_description)
    ON CONFLICT (setting_key)
    DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        description = COALESCE(EXCLUDED.description, system_settings.description),
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Todos podem ver configurações" ON system_settings;
CREATE POLICY "Todos podem ver configurações" ON system_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admins podem modificar configurações" ON system_settings;
CREATE POLICY "Apenas admins podem modificar configurações" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Inserir configuração padrão da loja
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('loja_visible', 'false', 'Controla se a aba Loja é visível para todos os usuários (true/false)')
ON CONFLICT (setting_key) DO NOTHING;

-- Comentários
COMMENT ON TABLE system_settings IS 'Configurações do sistema controladas por administradores';
COMMENT ON COLUMN system_settings.setting_key IS 'Chave única da configuração';
COMMENT ON COLUMN system_settings.setting_value IS 'Valor da configuração (string)';
COMMENT ON COLUMN system_settings.description IS 'Descrição da configuração'; 