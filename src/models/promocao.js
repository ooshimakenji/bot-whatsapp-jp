const { getSupabase } = require('../services/supabase');

function gerarCodigoPromocao() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = 'JP';
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

async function criarPromocao(dados) {
  const codigo = gerarCodigoPromocao();

  const { data, error } = await getSupabase()
    .from('promocoes')
    .insert([{ ...dados, codigo }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar promocao:', error);
    return null;
  }

  return data;
}

async function buscarPromocoesAtivas(clienteId) {
  const hoje = new Date().toISOString().split('T')[0];

  const { data, error } = await getSupabase()
    .from('promocoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('usado', false)
    .gte('validade', hoje);

  if (error) {
    console.error('Erro ao buscar promocoes ativas:', error);
    return [];
  }

  return data;
}

async function usarPromocao(codigo) {
  const { data, error } = await getSupabase()
    .from('promocoes')
    .update({ usado: true })
    .eq('codigo', codigo)
    .eq('usado', false)
    .select()
    .single();

  if (error) {
    console.error('Erro ao usar promocao:', error);
    return null;
  }

  return data;
}

async function buscarPromocaoPorCodigo(codigo) {
  const { data, error } = await getSupabase()
    .from('promocoes')
    .select('*, clientes(*)')
    .eq('codigo', codigo)
    .single();

  if (error) {
    console.error('Erro ao buscar promocao por codigo:', error);
    return null;
  }

  return data;
}

async function criarPromocao6Meses(clienteId) {
  const validade = new Date();
  validade.setMonth(validade.getMonth() + 1); // Válida por 1 mês

  return criarPromocao({
    cliente_id: clienteId,
    tipo: '6_meses',
    desconto: 30,
    validade: validade.toISOString().split('T')[0],
  });
}

async function criarPromocaoAnual(clienteId) {
  const validade = new Date();
  validade.setMonth(validade.getMonth() + 1);

  return criarPromocao({
    cliente_id: clienteId,
    tipo: 'anual',
    desconto: 15,
    validade: validade.toISOString().split('T')[0],
  });
}

async function buscarClientesParaPromocao6Meses() {
  // Busca clientes que fizeram serviço há 6 meses e não têm promoção ativa
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const { data, error } = await getSupabase()
    .from('servicos')
    .select('clientes(*)')
    .eq('status', 'concluido')
    .lte('updated_at', seisMesesAtras.toISOString())
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes para promocao 6 meses:', error);
    return [];
  }

  // Filtra clientes únicos
  const clientesUnicos = [];
  const telefoneVistos = new Set();

  for (const servico of data || []) {
    if (servico.clientes && !telefoneVistos.has(servico.clientes.telefone)) {
      telefoneVistos.add(servico.clientes.telefone);
      clientesUnicos.push(servico.clientes);
    }
  }

  return clientesUnicos;
}

async function buscarClientesParaPromocaoAnual() {
  const umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

  const { data, error } = await getSupabase()
    .from('servicos')
    .select('clientes(*)')
    .eq('status', 'concluido')
    .lte('updated_at', umAnoAtras.toISOString())
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes para promocao anual:', error);
    return [];
  }

  const clientesUnicos = [];
  const telefoneVistos = new Set();

  for (const servico of data || []) {
    if (servico.clientes && !telefoneVistos.has(servico.clientes.telefone)) {
      telefoneVistos.add(servico.clientes.telefone);
      clientesUnicos.push(servico.clientes);
    }
  }

  return clientesUnicos;
}

module.exports = {
  criarPromocao,
  buscarPromocoesAtivas,
  usarPromocao,
  buscarPromocaoPorCodigo,
  criarPromocao6Meses,
  criarPromocaoAnual,
  buscarClientesParaPromocao6Meses,
  buscarClientesParaPromocaoAnual,
};
