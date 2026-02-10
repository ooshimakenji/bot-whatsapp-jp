const { getSupabase } = require('../services/supabase');

async function criarOrcamento(dados) {
  const { data, error } = await getSupabase()
    .from('orcamentos')
    .insert([dados])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar orcamento:', error);
    return null;
  }

  return data;
}

async function buscarOrcamentoPorServico(servicoId) {
  const { data, error } = await getSupabase()
    .from('orcamentos')
    .select('*')
    .eq('servico_id', servicoId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar orcamento:', error);
  }

  return data;
}

async function atualizarOrcamento(id, dados) {
  const { data, error } = await getSupabase()
    .from('orcamentos')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar orcamento:', error);
    return null;
  }

  return data;
}

async function registrarPagamento(id, valorPago) {
  const orcamento = await buscarOrcamentoPorId(id);
  if (!orcamento) return null;

  const novoSinalPago = (orcamento.sinal_pago || 0) + valorPago;

  return atualizarOrcamento(id, { sinal_pago: novoSinalPago });
}

async function buscarOrcamentoPorId(id) {
  const { data, error } = await getSupabase()
    .from('orcamentos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar orcamento por id:', error);
    return null;
  }

  return data;
}

module.exports = {
  criarOrcamento,
  buscarOrcamentoPorServico,
  buscarOrcamentoPorId,
  atualizarOrcamento,
  registrarPagamento,
};
