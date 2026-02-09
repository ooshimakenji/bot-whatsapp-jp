const { supabase } = require('../services/supabase');

async function buscarClientePorTelefone(telefone) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('telefone', telefone)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar cliente:', error);
  }

  return data;
}

async function criarCliente(dados) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([dados])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar cliente:', error);
    return null;
  }

  return data;
}

async function atualizarCliente(id, dados) {
  const { data, error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    return null;
  }

  return data;
}

async function buscarOuCriarCliente(telefone) {
  let cliente = await buscarClientePorTelefone(telefone);

  if (!cliente) {
    cliente = await criarCliente({ telefone });
  }

  return cliente;
}

module.exports = {
  buscarClientePorTelefone,
  criarCliente,
  atualizarCliente,
  buscarOuCriarCliente,
};
