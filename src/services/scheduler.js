const cron = require('node-cron');
const {
  buscarServicosParaLembrete,
  buscarClientesParaPromocao6Meses,
  buscarClientesParaPromocaoAnual,
  criarPromocao6Meses,
  criarPromocaoAnual,
  buscarPromocoesAtivas,
} = require('../models');
const {
  LEMBRETE_1_DIA,
  LEMBRETE_1_HORA,
  PROMOCAO_6_MESES,
  PROMOCAO_ANUAL,
} = require('../utils/prompts');
const { formatarParaJid, formatarData } = require('../utils/helpers');

let sockInstance = null;

/**
 * Inicializa o scheduler com a instância do socket
 * @param {object} sock - Socket do WhatsApp
 */
function iniciarScheduler(sock) {
  sockInstance = sock;

  // Lembrete 1 dia antes - roda todo dia às 9h
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Verificando lembretes de 1 dia...');
    await enviarLembretes1Dia();
  });

  // Lembrete 1 hora antes - roda a cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Verificando lembretes de 1 hora...');
    await enviarLembretes1Hora();
  });

  // Promoções - roda todo dia às 10h
  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] Verificando promoções...');
    await verificarPromocoes();
  });

  console.log('[Scheduler] Agendamentos iniciados');
}

/**
 * Envia lembretes para serviços agendados para amanhã
 */
async function enviarLembretes1Dia() {
  if (!sockInstance) return;

  try {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);

    const servicos = await buscarServicosParaLembrete();

    for (const servico of servicos) {
      const dataVisita = new Date(servico.data_visita);

      // Verifica se é para amanhã
      if (dataVisita.toDateString() === amanha.toDateString()) {
        const cliente = servico.clientes;
        if (!cliente?.telefone) continue;

        const horario = dataVisita.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const mensagem = LEMBRETE_1_DIA(
          cliente.nome,
          servico.tipo,
          formatarData(dataVisita),
          horario
        );

        const jid = formatarParaJid(cliente.telefone);

        try {
          await sockInstance.sendMessage(jid, { text: mensagem.trim() });
          console.log(`[Scheduler] Lembrete 1 dia enviado para ${cliente.telefone}`);
        } catch (error) {
          console.error(`[Scheduler] Erro ao enviar lembrete para ${cliente.telefone}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Erro ao enviar lembretes 1 dia:', error);
  }
}

/**
 * Envia lembretes para serviços na próxima hora
 */
async function enviarLembretes1Hora() {
  if (!sockInstance) return;

  try {
    const agora = new Date();
    const emUmaHora = new Date(agora.getTime() + 60 * 60 * 1000);

    const servicos = await buscarServicosParaLembrete();

    for (const servico of servicos) {
      const dataVisita = new Date(servico.data_visita);

      // Verifica se é dentro da próxima hora
      if (dataVisita >= agora && dataVisita <= emUmaHora) {
        const cliente = servico.clientes;
        if (!cliente?.telefone) continue;

        const mensagem = LEMBRETE_1_HORA(cliente.nome, servico.tipo);
        const jid = formatarParaJid(cliente.telefone);

        try {
          await sockInstance.sendMessage(jid, { text: mensagem.trim() });
          console.log(`[Scheduler] Lembrete 1 hora enviado para ${cliente.telefone}`);
        } catch (error) {
          console.error(`[Scheduler] Erro ao enviar lembrete 1h para ${cliente.telefone}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Erro ao enviar lembretes 1 hora:', error);
  }
}

/**
 * Verifica e envia promoções (6 meses e anual)
 */
async function verificarPromocoes() {
  if (!sockInstance) return;

  try {
    // Promoção 6 meses (30% desconto)
    const clientes6Meses = await buscarClientesParaPromocao6Meses();

    for (const cliente of clientes6Meses) {
      // Verifica se já tem promoção ativa
      const promocoesAtivas = await buscarPromocoesAtivas(cliente.id);
      if (promocoesAtivas.length > 0) continue;

      // Cria promoção
      const promocao = await criarPromocao6Meses(cliente.id);
      if (!promocao) continue;

      const mensagem = PROMOCAO_6_MESES(cliente.nome, promocao.codigo);
      const jid = formatarParaJid(cliente.telefone);

      try {
        await sockInstance.sendMessage(jid, { text: mensagem.trim() });
        console.log(`[Scheduler] Promoção 6 meses enviada para ${cliente.telefone}`);
      } catch (error) {
        console.error(`[Scheduler] Erro ao enviar promoção 6 meses para ${cliente.telefone}:`, error);
      }
    }

    // Promoção anual (15% desconto)
    const clientesAnual = await buscarClientesParaPromocaoAnual();

    for (const cliente of clientesAnual) {
      const promocoesAtivas = await buscarPromocoesAtivas(cliente.id);
      if (promocoesAtivas.length > 0) continue;

      const promocao = await criarPromocaoAnual(cliente.id);
      if (!promocao) continue;

      const mensagem = PROMOCAO_ANUAL(cliente.nome, promocao.codigo);
      const jid = formatarParaJid(cliente.telefone);

      try {
        await sockInstance.sendMessage(jid, { text: mensagem.trim() });
        console.log(`[Scheduler] Promoção anual enviada para ${cliente.telefone}`);
      } catch (error) {
        console.error(`[Scheduler] Erro ao enviar promoção anual para ${cliente.telefone}:`, error);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Erro ao verificar promoções:', error);
  }
}

module.exports = {
  iniciarScheduler,
  enviarLembretes1Dia,
  enviarLembretes1Hora,
  verificarPromocoes,
};
