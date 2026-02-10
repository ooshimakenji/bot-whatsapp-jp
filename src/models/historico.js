const { getSupabase } = require('../services/supabase');

const LIMITE_HISTORICO = 10; // Últimas 10 mensagens para contexto
const JANELA_HORAS = 24; // Só puxa mensagens das últimas 24h

async function salvarMensagem(clienteId, role, mensagem) {
  const { data, error } = await getSupabase()
    .from('historico')
    .insert([{ cliente_id: clienteId, role, mensagem }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar mensagem:', error);
    return null;
  }

  return data;
}

async function buscarHistorico(clienteId, limite = LIMITE_HISTORICO) {
  const desde = new Date(Date.now() - JANELA_HORAS * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabase()
    .from('historico')
    .select('*')
    .eq('cliente_id', clienteId)
    .gte('created_at', desde)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('Erro ao buscar historico:', error);
    return [];
  }

  // Retorna em ordem cronológica (mais antigo primeiro)
  return data.reverse();
}

async function limparHistoricoAntigo(clienteId, manterUltimas = 50) {
  // Busca IDs das mensagens a manter
  const { data: mensagensRecentes } = await getSupabase()
    .from('historico')
    .select('id')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .limit(manterUltimas);

  if (!mensagensRecentes || mensagensRecentes.length === 0) return;

  const idsParaManter = mensagensRecentes.map(m => m.id);

  // Deleta mensagens antigas
  const { error } = await getSupabase()
    .from('historico')
    .delete()
    .eq('cliente_id', clienteId)
    .not('id', 'in', `(${idsParaManter.join(',')})`);

  if (error) {
    console.error('Erro ao limpar historico antigo:', error);
  }
}

async function formatarHistoricoParaGemini(clienteId) {
  const historico = await buscarHistorico(clienteId);

  return historico.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.mensagem }],
  }));
}

module.exports = {
  salvarMensagem,
  buscarHistorico,
  limparHistoricoAntigo,
  formatarHistoricoParaGemini,
};
