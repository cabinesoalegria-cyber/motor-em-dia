-- ============================================================
-- Motor em Dia — Migration v2.1
-- Adiciona campos: mecanico e pagamento na tabela ordens_servico
-- Execute este SQL no editor SQL do Supabase Dashboard
-- ============================================================

-- Adiciona campo do mecânico responsável
ALTER TABLE ordens_servico
  ADD COLUMN IF NOT EXISTS mecanico text;

-- Adiciona campo de pagamento (JSON com formas de pagamento)
ALTER TABLE ordens_servico
  ADD COLUMN IF NOT EXISTS pagamento jsonb;

-- Index para relatórios por mecânico
CREATE INDEX IF NOT EXISTS idx_ordens_servico_mecanico
  ON ordens_servico (empresa_id, mecanico);

-- Comentários
COMMENT ON COLUMN ordens_servico.mecanico IS 'Nome do mecânico responsável pela OS (campo interno, não aparece para o cliente)';
COMMENT ON COLUMN ordens_servico.pagamento IS 'JSON com as formas de pagamento registradas ao finalizar a OS. Estrutura: { formas: [{id, tipo, valor, parcelas?, obs?, descricaoOutro?}], total, dataRegistro }';
