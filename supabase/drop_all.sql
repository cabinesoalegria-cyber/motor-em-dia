-- ============================================================
-- STEP 1: LIMPAR TUDO (rode isso primeiro em uma query separada)
-- ============================================================
DROP TABLE IF EXISTS 
  admin_logs, contas_pagar, servicos_catalogo, orcamentos, 
  agendamentos, lancamentos, pecas, ordens_servico, 
  veiculos, clientes, usuarios, empresas 
CASCADE;

DROP FUNCTION IF EXISTS get_user_empresa_id() CASCADE;
DROP FUNCTION IF EXISTS is_master() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_admin_stats() CASCADE;
