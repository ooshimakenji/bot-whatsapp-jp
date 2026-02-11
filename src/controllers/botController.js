// Usa Groq (Llama) em vez de Gemini para evitar limites de quota
const { gerarResposta, analisarImagem, transcreverAudio, extrairIntencao } = require('../services/groq');
const {
  buscarOuCriarCliente,
  atualizarCliente,
  buscarServicoPendente,
  criarServico,
  atualizarServico,
  salvarMensagem,
  formatarHistoricoParaGemini,
  buscarPromocoesAtivas,
} = require('../models');
const {
  extrairTelefone,
  extrairInfoDaResposta,
  limparRespostaParaCliente,
  isGrupo,
} = require('../utils/helpers');
const {
  buscarRespostaAutomatica,
  deveIgnorar,
} = require('../utils/respostasAutomaticas');
const {
  extrairAnaliseImagem,
  limparAnaliseParaCliente,
  gerarMensagemEstimativa,
} = require('../utils/precos');
const {
  verificarMensagem,
  verificarGemini,
} = require('../utils/rateLimit');

/**
 * Simula digitação humana antes de enviar resposta
 * @param {object} sock - Socket do WhatsApp
 * @param {string} sender - ID do destinatário
 * @param {string} resposta - Texto da resposta (para calcular delay)
 */
async function simularDigitacao(sock, sender, resposta) {
  try {
    // Mostra "digitando..." no WhatsApp
    await sock.sendPresenceUpdate('composing', sender);

    // Calcula delay baseado no tamanho da resposta
    // Base: 1-2 segundos + ~20ms por caractere (simula digitação)
    const baseDelay = 1000 + Math.random() * 1000; // 1-2 segundos
    const charDelay = Math.min(resposta.length * 20, 3000); // máx 3 segundos extra
    const totalDelay = baseDelay + charDelay;

    // Aguarda o tempo calculado
    await new Promise(resolve => setTimeout(resolve, totalDelay));

    // Para de mostrar "digitando..."
    await sock.sendPresenceUpdate('paused', sender);
  } catch (error) {
    // Ignora erros de presença (não é crítico)
    console.log('Aviso: não foi possível simular digitação');
  }
}

/**
 * Processa mensagem de texto recebida
 * @param {object} sock - Socket do WhatsApp
 * @param {object} msg - Mensagem recebida
 */
async function processarMensagemTexto(sock, msg) {
  const sender = msg.key.remoteJid;

  // Ignora grupos
  if (isGrupo(sender)) return;

  const telefone = extrairTelefone(sender);
  const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

  if (!texto.trim()) return;

  // Ignora mensagens que não precisam de resposta (emojis, risadas, etc)
  if (deveIgnorar(texto)) {
    console.log(`[${telefone}] Mensagem ignorada: ${texto}`);
    return;
  }

  // Verifica rate limit
  const limiteMsg = verificarMensagem(telefone, texto);
  if (!limiteMsg.permitido) {
    console.log(`[${telefone}] Rate limit: ${limiteMsg.motivo}`);
    await sock.sendMessage(sender, { text: limiteMsg.motivo });
    return;
  }

  console.log(`[${telefone}] Mensagem recebida: ${texto}`);

  try {
    // Busca ou cria cliente
    const cliente = await buscarOuCriarCliente(telefone);
    if (!cliente) {
      console.error('Erro ao buscar/criar cliente');
      return;
    }

    // Salva mensagem do usuário no histórico
    await salvarMensagem(cliente.id, 'user', texto);

    // Busca contexto do cliente
    const servicoPendente = await buscarServicoPendente(cliente.id);
    const promocoesAtivas = await buscarPromocoesAtivas(cliente.id);

    let respostaFinal;
    let usouGroq = false;

    // PRIMEIRO: Tenta resposta automática (economiza tokens)
    const respostaAuto = buscarRespostaAutomatica(texto, { cliente, servicoPendente });
    if (respostaAuto) {
      respostaFinal = respostaAuto;
      console.log(`[${telefone}] Resposta automática usada`);
    }

    // SEGUNDO: Se não teve resposta automática, usa Gemini
    if (!respostaFinal) {
      // Verifica rate limit do Gemini
      const limiteGemini = verificarGemini(telefone);
      if (!limiteGemini.permitido) {
        console.log(`[${telefone}] Gemini bloqueado: ${limiteGemini.motivo}`);
        respostaFinal = limiteGemini.motivo;
      } else {
        usouGroq = true;
        const historicoConversa = await formatarHistoricoParaGemini(cliente.id);

        const contexto = {
          nome: cliente.nome,
          servicoPendente,
          promocoesAtivas,
        };

        const respostaCompleta = await gerarResposta(texto, historicoConversa, contexto);

        // Extrai e processa informações da resposta
        const infoExtraida = extrairInfoDaResposta(respostaCompleta);
        if (infoExtraida) {
          await processarInfoExtraida(cliente, servicoPendente, infoExtraida);
        }

        // Limpa resposta para enviar ao cliente
        respostaFinal = limparRespostaParaCliente(respostaCompleta);
        console.log(`[${telefone}] Groq/Llama usado`);
      }
    }

    // Salva resposta no histórico
    await salvarMensagem(cliente.id, 'assistant', respostaFinal);

    // Simula digitação antes de enviar
    await simularDigitacao(sock, sender, respostaFinal);

    // Envia resposta
    await sock.sendMessage(sender, { text: respostaFinal });

    console.log(`[${telefone}] Resposta enviada (${usouGroq ? 'Groq' : 'Auto'})`);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    await sock.sendMessage(sender, {
      text: 'Desculpe, estou com dificuldades técnicas no momento. Me chama de novo em alguns minutos!',
    });
  }
}

/**
 * Processa mensagem com imagem
 * @param {object} sock - Socket do WhatsApp
 * @param {object} msg - Mensagem recebida
 */
async function processarMensagemImagem(sock, msg) {
  const sender = msg.key.remoteJid;

  if (isGrupo(sender)) return;

  const telefone = extrairTelefone(sender);

  // Verifica rate limit (imagem conta como mensagem + gemini)
  const limiteMsg = verificarMensagem(telefone, '[imagem]');
  if (!limiteMsg.permitido) {
    console.log(`[${telefone}] Rate limit imagem: ${limiteMsg.motivo}`);
    await sock.sendMessage(sender, { text: limiteMsg.motivo });
    return;
  }

  const limiteGemini = verificarGemini(telefone);
  if (!limiteGemini.permitido) {
    console.log(`[${telefone}] Gemini bloqueado para imagem: ${limiteGemini.motivo}`);
    await sock.sendMessage(sender, {
      text: 'Recebi sua foto! Estou com muitas mensagens no momento. Me manda de novo daqui a pouquinho que analiso pra você!',
    });
    return;
  }

  console.log(`[${telefone}] Imagem recebida`);

  try {
    // Busca ou cria cliente
    const cliente = await buscarOuCriarCliente(telefone);
    if (!cliente) return;

    // Baixa a imagem
    const imageMessage = msg.message.imageMessage;
    const stream = await sock.downloadMediaMessage(msg);

    // Converte stream para buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Analisa imagem com Gemini
    const mimeType = imageMessage.mimetype || 'image/jpeg';
    const analiseCompleta = await analisarImagem(buffer, mimeType);

    // Extrai dados estruturados da análise
    const dadosAnalise = extrairAnaliseImagem(analiseCompleta);

    // Limpa a resposta para o cliente (remove tag [ANALISE:...])
    let respostaCliente = limparAnaliseParaCliente(analiseCompleta);

    // Adiciona estimativa de preço se tiver dados suficientes
    if (dadosAnalise) {
      const estimativa = gerarMensagemEstimativa(dadosAnalise);
      if (estimativa) {
        respostaCliente += estimativa;
      }

      // Cria ou atualiza serviço com os dados da imagem
      const servicoPendente = await buscarServicoPendente(cliente.id);

      if (dadosAnalise.tipo === 'sofa' || dadosAnalise.tipo === 'ar_condicionado') {
        const tipoServico = dadosAnalise.tipo === 'sofa' ? 'sofa' : 'ar_condicionado';

        if (!servicoPendente) {
          // Cria novo serviço
          const descricao = [];
          if (dadosAnalise.lugares) descricao.push(`${dadosAnalise.lugares} lugares`);
          if (dadosAnalise.material) descricao.push(dadosAnalise.material);
          if (dadosAnalise.cor) descricao.push(`cor ${dadosAnalise.cor}`);
          if (dadosAnalise.estado) descricao.push(`estado ${dadosAnalise.estado}`);
          if (dadosAnalise.manchas === 'sim') descricao.push('com manchas');
          if (dadosAnalise.modelo_ar) descricao.push(dadosAnalise.modelo_ar);

          await criarServico({
            cliente_id: cliente.id,
            tipo: tipoServico,
            descricao: descricao.join(', ') || null,
            observacoes: dadosAnalise.observacoes || null,
            status: 'pendente',
          });

          console.log(`[${telefone}] Serviço criado a partir da imagem: ${tipoServico}`);
        } else {
          // Atualiza serviço existente com mais detalhes
          const descricaoExtra = [];
          if (dadosAnalise.lugares) descricaoExtra.push(`${dadosAnalise.lugares} lugares`);
          if (dadosAnalise.material) descricaoExtra.push(dadosAnalise.material);
          if (dadosAnalise.manchas === 'sim') descricaoExtra.push('manchas identificadas na foto');

          const novaDescricao = servicoPendente.descricao
            ? `${servicoPendente.descricao}, ${descricaoExtra.join(', ')}`
            : descricaoExtra.join(', ');

          await atualizarServico(servicoPendente.id, {
            descricao: novaDescricao,
            observacoes: dadosAnalise.observacoes || servicoPendente.observacoes,
          });

          console.log(`[${telefone}] Serviço atualizado com dados da imagem`);
        }
      }
    }

    // Salva no histórico
    await salvarMensagem(cliente.id, 'user', '[Enviou uma imagem]');
    await salvarMensagem(cliente.id, 'assistant', respostaCliente);

    // Caption da imagem (se houver)
    const caption = imageMessage.caption || '';
    if (caption) {
      await salvarMensagem(cliente.id, 'user', caption);
    }

    // Simula digitação e envia análise
    await simularDigitacao(sock, sender, respostaCliente);
    await sock.sendMessage(sender, { text: respostaCliente });

    console.log(`[${telefone}] Análise de imagem enviada (${dadosAnalise?.lugares || '?'} lugares detectados)`);
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    await sock.sendMessage(sender, {
      text: 'Recebi sua foto! Me descreve o que tem na imagem que te passo uma estimativa de preço.',
    });
  }
}

/**
 * Processa informações extraídas da resposta do Gemini
 */
async function processarInfoExtraida(cliente, servicoPendente, info) {
  try {
    // Atualiza dados do cliente se houver novos
    const dadosCliente = {};
    if (info.nome && !cliente.nome) dadosCliente.nome = info.nome;
    if (info.endereco) dadosCliente.endereco = info.endereco;
    if (info.tem_pet !== undefined) dadosCliente.tem_pet = info.tem_pet === 'sim';

    if (Object.keys(dadosCliente).length > 0) {
      await atualizarCliente(cliente.id, dadosCliente);
    }

    // Cria serviço se identificado e não existe pendente
    if (info.servico && !servicoPendente) {
      const tipoServico = info.servico === 'sofa' ? 'sofa' :
        info.servico === 'ar' || info.servico === 'ar_condicionado' ? 'ar_condicionado' :
        info.servico === 'ambos' ? 'ambos' : null;

      if (tipoServico) {
        const descricao = [];
        if (info.lugares) descricao.push(`${info.lugares} lugares`);
        if (info.material) descricao.push(info.material);
        if (info.manchas) descricao.push(`manchas: ${info.manchas}`);

        await criarServico({
          cliente_id: cliente.id,
          tipo: tipoServico,
          descricao: descricao.join(', ') || null,
          status: 'pendente',
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar info extraída:', error);
  }
}

/**
 * Processa mensagem de áudio - transcreve e responde
 */
async function processarMensagemAudio(sock, msg) {
  const sender = msg.key.remoteJid;

  if (isGrupo(sender)) return;

  const telefone = extrairTelefone(sender);

  const limiteMsg = verificarMensagem(telefone, '[audio]');
  if (!limiteMsg.permitido) {
    await sock.sendMessage(sender, { text: limiteMsg.motivo });
    return;
  }

  console.log(`[${telefone}] Áudio recebido`);

  try {
    const cliente = await buscarOuCriarCliente(telefone);
    if (!cliente) return;

    // Baixa o áudio
    const audioMessage = msg.message.audioMessage;
    const stream = await sock.downloadMediaMessage(msg);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Transcreve com Whisper
    const mimeType = audioMessage.mimetype || 'audio/ogg; codecs=opus';
    const textoTranscrito = await transcreverAudio(buffer, mimeType);

    if (!textoTranscrito) {
      await sock.sendMessage(sender, {
        text: 'Não consegui entender o áudio. Pode mandar por texto? 😊',
      });
      return;
    }

    console.log(`[${telefone}] Áudio transcrito: ${textoTranscrito}`);

    // Salva a transcrição como mensagem do usuário
    await salvarMensagem(cliente.id, 'user', `[Áudio] ${textoTranscrito}`);

    // Processa como texto normal via Groq
    const servicoPendente = await buscarServicoPendente(cliente.id);
    const promocoesAtivas = await buscarPromocoesAtivas(cliente.id);
    const historicoConversa = await formatarHistoricoParaGemini(cliente.id);

    const contexto = {
      nome: cliente.nome,
      servicoPendente,
      promocoesAtivas,
    };

    const respostaCompleta = await gerarResposta(textoTranscrito, historicoConversa, contexto);

    const infoExtraida = extrairInfoDaResposta(respostaCompleta);
    if (infoExtraida) {
      await processarInfoExtraida(cliente, servicoPendente, infoExtraida);
    }

    const respostaFinal = limparRespostaParaCliente(respostaCompleta);

    await salvarMensagem(cliente.id, 'assistant', respostaFinal);
    await simularDigitacao(sock, sender, respostaFinal);
    await sock.sendMessage(sender, { text: respostaFinal });

    console.log(`[${telefone}] Resposta enviada (Áudio→Groq)`);
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    await sock.sendMessage(sender, {
      text: 'Não consegui processar o áudio. Pode mandar por texto? 😊',
    });
  }
}

/**
 * Handler principal de mensagens
 */
async function handleMessage(sock, msg) {
  // Ignora mensagens próprias e de status
  if (!msg?.message || msg.key.fromMe) return;
  if (msg.key.remoteJid === 'status@broadcast') return;

  const tipoMensagem = Object.keys(msg.message)[0];

  switch (tipoMensagem) {
    case 'conversation':
    case 'extendedTextMessage':
      await processarMensagemTexto(sock, msg);
      break;

    case 'imageMessage':
      await processarMensagemImagem(sock, msg);
      break;

    case 'audioMessage':
      await processarMensagemAudio(sock, msg);
      break;

    default:
      console.log(`Tipo de mensagem não suportado: ${tipoMensagem}`);
  }
}

module.exports = {
  handleMessage,
  processarMensagemTexto,
  processarMensagemImagem,
};
