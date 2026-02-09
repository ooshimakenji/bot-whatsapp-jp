-- =============================================
-- Schema do Banco de Dados - JP empresa Teste
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255),
  telefone VARCHAR(20) UNIQUE NOT NULL,
  endereco TEXT,
  tem_pet BOOLEAN DEFAULT FALSE,
  aniversario DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('sofa', 'ar_condicionado', 'ambos')),
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'orcamento_enviado', 'aprovado', 'agendado', 'concluido', 'cancelado')),
  descricao TEXT,
  data_visita TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2),
  sinal_pago DECIMAL(10, 2) DEFAULT 0,
  saldo DECIMAL(10, 2) GENERATED ALWAYS AS (valor - sinal_pago) STORED,
  forma_pagamento VARCHAR(50),
  aprovado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Histórico de Mensagens
CREATE TABLE IF NOT EXISTS historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Promoções
CREATE TABLE IF NOT EXISTS promocoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('6_meses', 'anual', 'aniversario', 'indicacao')),
  desconto INTEGER NOT NULL,
  validade DATE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  codigo VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Disponibilidade (para agendamento automático)
CREATE TABLE IF NOT EXISTS disponibilidade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_id ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos(status);
CREATE INDEX IF NOT EXISTS idx_servicos_data_visita ON servicos(data_visita);
CREATE INDEX IF NOT EXISTS idx_historico_cliente_id ON historico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_promocoes_cliente_id ON promocoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidade_data ON disponibilidade(data);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidade ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permite tudo via service_role key)
CREATE POLICY "Allow all for service role" ON clientes FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON servicos FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON orcamentos FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON historico FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON promocoes FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON disponibilidade FOR ALL USING (true);
