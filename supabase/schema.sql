-- ============================================================
-- MOTOR EM DIA — SaaS Schema v3 (ordem corrigida)
-- Instruções:
--   1. Abra o SQL Editor do Supabase
--   2. Cole TUDO isso em uma nova query
--   3. Clique RUN
-- ============================================================

-- Habilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS PRIMEIRO (sem funções de RLS ainda)
-- ============================================================

-- EMPRESAS
CREATE TABLE IF NOT EXISTS empresas (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome                text NOT NULL,
  proprietario        text,
  email               text,
  whatsapp            text,
  cidade              text,
  cnpj                text,
  plano               text DEFAULT 'trial',
  status              text DEFAULT 'ativo',
  trial_expira_em     timestamptz DEFAULT (now() + interval '14 days'),
  logo_url            text,
  telefone            text,
  endereco            text,
  onboarding_completo boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- USUARIOS (depende de empresas)
CREATE TABLE IF NOT EXISTS usuarios (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id  uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome        text,
  email       text,
  role        text DEFAULT 'proprietario',
  created_at  timestamptz DEFAULT now()
);

-- CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id  uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  telefone    text,
  whatsapp    text,
  cpf_cnpj    text,
  email       text,
  endereco    text,
  observacoes text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- VEICULOS
CREATE TABLE IF NOT EXISTS veiculos (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id      uuid REFERENCES clientes(id) ON DELETE SET NULL,
  marca           text,
  modelo          text,
  ano             integer,
  placa           text,
  cor             text,
  quilometragem   numeric DEFAULT 0,
  observacoes     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ORDENS DE SERVICO
CREATE TABLE IF NOT EXISTS ordens_servico (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id           uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero               text,
  cliente_id           uuid REFERENCES clientes(id) ON DELETE SET NULL,
  veiculo_id           uuid REFERENCES veiculos(id) ON DELETE SET NULL,
  status               text DEFAULT 'em_andamento',
  problema_relatado    text,
  observacoes_internas text,
  quilometragem_atual  numeric DEFAULT 0,
  valor_mao_de_obra    numeric DEFAULT 0,
  valor_pecas          numeric DEFAULT 0,
  valor_total          numeric DEFAULT 0,
  servicos             jsonb DEFAULT '[]'::jsonb,
  pecas                jsonb DEFAULT '[]'::jsonb,
  data_entrada         date DEFAULT CURRENT_DATE,
  data_conclusao       date,
  lancamento_id        uuid,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- PECAS (ESTOQUE)
CREATE TABLE IF NOT EXISTS pecas (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id        uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome              text NOT NULL,
  codigo            text,
  quantidade        numeric DEFAULT 0,
  quantidade_minima numeric DEFAULT 0,
  custo             numeric DEFAULT 0,
  fornecedor        text,
  marca_veiculo     text,
  modelo_veiculo    text,
  ano_veiculo       text,
  motorizacao       text,
  cambio            text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- LANCAMENTOS FINANCEIROS
CREATE TABLE IF NOT EXISTS lancamentos (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id        uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo              text NOT NULL,
  descricao         text,
  valor             numeric NOT NULL,
  data              date DEFAULT CURRENT_DATE,
  ordem_servico_id  uuid REFERENCES ordens_servico(id) ON DELETE SET NULL,
  cliente_id        uuid REFERENCES clientes(id) ON DELETE SET NULL,
  pago              boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id  uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id  uuid REFERENCES clientes(id) ON DELETE SET NULL,
  veiculo_id  uuid REFERENCES veiculos(id) ON DELETE SET NULL,
  servico     text,
  data        date,
  hora        text,
  status      text DEFAULT 'agendado',
  observacoes text,
  created_at  timestamptz DEFAULT now()
);

-- ORCAMENTOS
CREATE TABLE IF NOT EXISTS orcamentos (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id        uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero            text,
  cliente_id        uuid REFERENCES clientes(id) ON DELETE SET NULL,
  veiculo_id        uuid REFERENCES veiculos(id) ON DELETE SET NULL,
  itens             jsonb DEFAULT '[]'::jsonb,
  valor_total       numeric DEFAULT 0,
  validade          date,
  status            text DEFAULT 'pendente',
  observacoes       text,
  ordem_servico_id  uuid REFERENCES ordens_servico(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- CATALOGO DE SERVICOS
CREATE TABLE IF NOT EXISTS servicos_catalogo (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id   uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome         text NOT NULL,
  categoria    text,
  valor_padrao numeric NOT NULL DEFAULT 0,
  descricao    text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS contas_pagar (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id      uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  descricao       text NOT NULL,
  fornecedor      text,
  valor           numeric NOT NULL,
  vencimento      date,
  pago            boolean DEFAULT false,
  data_pagamento  date,
  created_at      timestamptz DEFAULT now()
);

-- ADMIN LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id           uuid REFERENCES auth.users(id),
  action             text,
  target_empresa_id  uuid REFERENCES empresas(id),
  details            jsonb,
  created_at         timestamptz DEFAULT now()
);

-- ============================================================
-- FUNÇÕES HELPER (agora que as tabelas existem)
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS uuid AS $$
  SELECT empresa_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_master()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'master'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- HABILITAR RLS
-- ============================================================

ALTER TABLE empresas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS
-- ============================================================

-- EMPRESAS
CREATE POLICY "empresas_select" ON empresas
  FOR SELECT USING (id = get_user_empresa_id() OR is_master());

CREATE POLICY "empresas_update" ON empresas
  FOR UPDATE USING (id = get_user_empresa_id() OR is_master());

-- Permite inserção durante o cadastro (antes do usuario existir)
CREATE POLICY "empresas_insert" ON empresas
  FOR INSERT WITH CHECK (true);

-- USUARIOS
CREATE POLICY "usuarios_select" ON usuarios
  FOR SELECT USING (
    id = auth.uid()
    OR empresa_id = get_user_empresa_id()
    OR is_master()
  );

-- Permite inserção durante o cadastro
CREATE POLICY "usuarios_insert" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "usuarios_update" ON usuarios
  FOR UPDATE USING (id = auth.uid() OR is_master());

-- DEMAIS TABELAS (acesso por empresa_id)
CREATE POLICY "clientes_policy"          ON clientes          FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "veiculos_policy"          ON veiculos          FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "ordens_policy"            ON ordens_servico    FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "pecas_policy"             ON pecas             FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "lancamentos_policy"       ON lancamentos       FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "agendamentos_policy"      ON agendamentos      FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "orcamentos_policy"        ON orcamentos        FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "servicos_catalogo_policy" ON servicos_catalogo FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "contas_pagar_policy"      ON contas_pagar      FOR ALL USING (empresa_id = get_user_empresa_id() OR is_master());
CREATE POLICY "admin_logs_policy"        ON admin_logs        FOR ALL USING (is_master());

-- ============================================================
-- TRIGGER updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at      BEFORE UPDATE ON clientes          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_veiculos_updated_at      BEFORE UPDATE ON veiculos           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ordens_updated_at        BEFORE UPDATE ON ordens_servico     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pecas_updated_at         BEFORE UPDATE ON pecas              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orcamentos_updated_at    BEFORE UPDATE ON orcamentos         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_servicos_updated_at      BEFORE UPDATE ON servicos_catalogo  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNÇÃO ADMIN STATS
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  IF NOT is_master() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'total_empresas',  (SELECT COUNT(*) FROM empresas),
    'ativas',          (SELECT COUNT(*) FROM empresas WHERE status = 'ativo'),
    'trial',           (SELECT COUNT(*) FROM empresas WHERE plano = 'trial'),
    'total_ordens',    (SELECT COUNT(*) FROM ordens_servico),
    'total_clientes',  (SELECT COUNT(*) FROM clientes),
    'faturamento_mes', (
      SELECT COALESCE(SUM(valor), 0) FROM lancamentos
      WHERE tipo = 'entrada'
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now())
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNÇÃO DE CADASTRO (SECURITY DEFINER = bypassa RLS)
-- Usada pelo signUp para criar empresa + usuario atomicamente
-- ============================================================

CREATE OR REPLACE FUNCTION criar_empresa_e_usuario(
  p_user_id          uuid,
  p_nome_oficina     text,
  p_proprietario     text,
  p_email            text,
  p_whatsapp         text,
  p_cidade           text,
  p_cnpj             text DEFAULT NULL,
  p_trial_expira_em  timestamptz DEFAULT (now() + interval '14 days')
)
RETURNS uuid AS $$
DECLARE
  v_empresa_id uuid;
BEGIN
  -- Insere empresa
  INSERT INTO empresas (
    nome, proprietario, email, whatsapp, cidade, cnpj,
    plano, status, trial_expira_em, onboarding_completo
  ) VALUES (
    p_nome_oficina, p_proprietario, p_email, p_whatsapp,
    p_cidade, p_cnpj, 'trial', 'ativo', p_trial_expira_em, false
  )
  RETURNING id INTO v_empresa_id;

  -- Insere usuario
  INSERT INTO usuarios (id, empresa_id, nome, email, role)
  VALUES (p_user_id, v_empresa_id, p_proprietario, p_email, 'proprietario');

  RETURN v_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permite que qualquer usuário (inclusive recém-criado) execute
GRANT EXECUTE ON FUNCTION criar_empresa_e_usuario TO anon, authenticated;

-- ============================================================
-- PRONTO!
-- Para virar master admin, execute:
-- UPDATE usuarios SET role = 'master' WHERE email = 'seu@email.com';
-- ============================================================
