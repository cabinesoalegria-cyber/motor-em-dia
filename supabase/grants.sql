-- ============================================================
-- GRANTS — Permissões para roles anon e authenticated
-- Execute isso APÓS o schema.sql
-- ============================================================

-- Acesso ao schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Permissão em todas as tabelas
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Permissão em sequences (para UUIDs gerados por sequência)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Permissão para executar as funções
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Garantir que novas tabelas futuras também tenham permissão
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated;
