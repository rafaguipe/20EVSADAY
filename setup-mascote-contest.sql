-- =====================================================
-- CONFIGURAÇÃO DO CONCURSO DO MASCOTE
-- =====================================================

-- Criar tabela para sugestões de nomes do mascote
CREATE TABLE IF NOT EXISTS public.mascote_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mascote_suggestions_user_id ON public.mascote_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_mascote_suggestions_created_at ON public.mascote_suggestions(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.mascote_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para usuários logados podem inserir suas próprias sugestões
CREATE POLICY "Users can insert their own suggestions" ON public.mascote_suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários logados podem ver todas as sugestões
CREATE POLICY "Users can view all suggestions" ON public.mascote_suggestions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários podem atualizar suas próprias sugestões
CREATE POLICY "Users can update their own suggestions" ON public.mascote_suggestions
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários podem deletar suas próprias sugestões
CREATE POLICY "Users can delete their own suggestions" ON public.mascote_suggestions
    FOR DELETE USING (auth.uid() = user_id);

-- Função para obter todas as sugestões ordenadas por data de criação
CREATE OR REPLACE FUNCTION public.get_mascote_suggestions()
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    username VARCHAR(255),
    created_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        ms.id::UUID,
        ms.name::VARCHAR(100),
        ms.username::VARCHAR(255),
        ms.created_at::TIMESTAMPTZ
    FROM public.mascote_suggestions ms
    ORDER BY ms.created_at ASC;
$$;

-- Função para inserir nova sugestão
CREATE OR REPLACE FUNCTION public.insert_mascote_suggestion(
    p_name VARCHAR(100),
    p_username VARCHAR(255)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_suggestion_id UUID;
BEGIN
    -- Obter ID do usuário atual
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Inserir sugestão
    INSERT INTO public.mascote_suggestions (name, user_id, username)
    VALUES (p_name, v_user_id, p_username)
    RETURNING id INTO v_suggestion_id;
    
    RETURN v_suggestion_id;
END;
$$;

-- Conceder permissões
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mascote_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mascote_suggestions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_mascote_suggestion(VARCHAR, VARCHAR) TO authenticated;

-- Configurar owner das funções
ALTER FUNCTION public.get_mascote_suggestions() OWNER TO postgres;
ALTER FUNCTION public.insert_mascote_suggestion(VARCHAR, VARCHAR) OWNER TO postgres;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================
SELECT '🎯 SISTEMA DE CONCURSO DO MASCOTE CONFIGURADO COM SUCESSO!' as status;
