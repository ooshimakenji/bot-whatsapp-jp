const { supabase } = require('../services/supabase');

async function criarServico(dados) {
  const { data, error } = await supabase
    .from('servicos')
    .insert([dados])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar servico:', error);
    return null;
  }

  return data;
}

async function buscarServicoPorId(id) {
  const { data, error } = await supabase
    .from('servicos')
    .select('*, clientes(*), orcamentos(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar servico:', error);
    return null;
  }

  return data;
}

async function buscarServicosPorCliente(clienteId) {
  const { data, error } = await supabase
    .from('servicos')
    .select('*, orcamentos(*)')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar servicos do cliente:', error);
    return [];
  }

  return data;
}

async function buscarServicoPendente(clienteId) {
  const { data, error } = await supabase
    .from('servicos')
    .select('*, orcamentos(*)')
    .eq('cliente_id', clienteId)
    .in('status', ['pendente', 'orcamento_enviado', 'aprovado', 'agendado'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar servico pendente:', error);
  }

  return data;
}

async function atualizarServico(id, dados) {
  const { data, error } = await supabase
    .from('servicos')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar servico:', error);
    return null;
  }

  return data;
}

async function buscarServicosAgendadosParaData(data) {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const { data: servicos, error } = await supabase
    .from('servicos')
    .select('*, clientes(*)')
    .eq('status', 'agendado')
    .gte('data_visita', inicioDia.toISOString())
    .lte('data_visita', fimDia.toISOString());

  if (error) {
    console.error('Erro ao buscar servicos agendados:', error);
    return [];
  }

  return servicos;
}

async function buscarServicosParaLembrete() {
  const agora = new Date();
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);

  const { data: servicos, error } = await supabase
    .from('servicos')
    .select('*, clientes(*)')
    .eq('status', 'agendado')
    .gte('data_visita', agora.toISOString())
    .lte('data_visita', amanha.toISOString());

  if (error) {
    console.error('Erro ao buscar servicos para lembrete:', error);
    return [];
  }

  return servicos;
}

module.exports = {
  criarServico,
  buscarServicoPorId,
  buscarServicosPorCliente,
  buscarServicoPendente,
  atualizarServico,
  buscarServicosAgendadosParaData,
  buscarServicosParaLembrete,
};
