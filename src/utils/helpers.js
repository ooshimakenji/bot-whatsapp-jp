/**
 * Extrai número de telefone do JID do WhatsApp
 * @param {string} jid - Ex: "5511999999999@s.whatsapp.net"
 * @returns {string} - Ex: "5511999999999"
 */
function extrairTelefone(jid) {
  if (!jid) return '';
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

/**
 * Formata telefone para JID do WhatsApp
 * @param {string} telefone - Ex: "5511999999999"
 * @returns {string} - Ex: "5511999999999@s.whatsapp.net"
 */
function formatarParaJid(telefone) {
  const numero = telefone.replace(/\D/g, '');
  return `${numero}@s.whatsapp.net`;
}

/**
 * Formata data para exibição
 * @param {Date|string} data
 * @returns {string} - Ex: "15/01/2025"
 */
function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para exibição
 * @param {Date|string} data
 * @returns {string} - Ex: "15/01/2025 às 14:30"
 */
function formatarDataHora(data) {
  const d = new Date(data);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Formata valor em reais
 * @param {number} valor
 * @returns {string} - Ex: "R$ 150,00"
 */
function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Extrai informações do formato [INFO: ...] da resposta do Gemini
 * @param {string} texto
 * @returns {object|null}
 */
function extrairInfoDaResposta(texto) {
  const match = texto.match(/\[INFO:\s*([^\]]+)\]/);
  if (!match) return null;

  const info = {};
  const pares = match[1].split(',').map(p => p.trim());

  for (const par of pares) {
    const [chave, valor] = par.split('=').map(s => s.trim());
    if (chave && valor) {
      info[chave] = valor;
    }
  }

  return info;
}

/**
 * Remove o bloco [INFO: ...] da resposta para enviar ao cliente
 * @param {string} texto
 * @returns {string}
 */
function limparRespostaParaCliente(texto) {
  return texto.replace(/\[INFO:[^\]]+\]/g, '').trim();
}

/**
 * Verifica se é um grupo do WhatsApp
 * @param {string} jid
 * @returns {boolean}
 */
function isGrupo(jid) {
  return jid.endsWith('@g.us');
}

/**
 * Delay/sleep helper
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Traduz tipo de serviço para texto legível
 * @param {string} tipo
 * @returns {string}
 */
function traduzirTipoServico(tipo) {
  const tipos = {
    sofa: 'Limpeza de Sofá',
    ar_condicionado: 'Higienização de Ar-Condicionado',
    ambos: 'Limpeza de Sofá e Higienização de Ar-Condicionado',
  };
  return tipos[tipo] || tipo;
}

/**
 * Traduz status do serviço para texto legível
 * @param {string} status
 * @returns {string}
 */
function traduzirStatus(status) {
  const statuses = {
    pendente: 'Aguardando orçamento',
    orcamento_enviado: 'Orçamento enviado',
    aprovado: 'Aprovado',
    agendado: 'Agendado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return statuses[status] || status;
}

module.exports = {
  extrairTelefone,
  formatarParaJid,
  formatarData,
  formatarDataHora,
  formatarValor,
  extrairInfoDaResposta,
  limparRespostaParaCliente,
  isGrupo,
  delay,
  traduzirTipoServico,
  traduzirStatus,
};
