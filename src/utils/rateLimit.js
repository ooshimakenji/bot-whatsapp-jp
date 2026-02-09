/**
 * Sistema de Rate Limit para proteger contra abuso
 * Limita chamadas ao Gemini e mensagens por usuário
 */

// Configurações de limite
const CONFIG = {
  // Mensagens por usuário
  MENSAGENS_POR_MINUTO: 10,
  MENSAGENS_POR_HORA: 60,

  // Chamadas ao Gemini por usuário
  GEMINI_POR_MINUTO: 5,
  GEMINI_POR_HORA: 30,

  // Limite global (todos os usuários)
  GEMINI_GLOBAL_POR_MINUTO: 30,
  GEMINI_GLOBAL_POR_HORA: 500,

  // Tempo de bloqueio (em minutos)
  TEMPO_BLOQUEIO: 30,

  // Mensagens suspeitas (spam)
  MENSAGENS_IGUAIS_SEGUIDAS: 5,
};

// Armazenamento em memória
const contadores = {
  usuarios: new Map(),  // telefone -> { mensagens: [], gemini: [], bloqueadoAte: null }
  global: {
    gemini: [],
  },
};

// Lista de números bloqueados permanentemente
const NUMEROS_BLOQUEADOS = new Set([
  // Adicione números problemáticos aqui
  // '5511999999999',
]);

/**
 * Limpa entradas antigas do array de timestamps
 */
function limparAntigos(timestamps, minutos) {
  const limite = Date.now() - (minutos * 60 * 1000);
  return timestamps.filter(t => t > limite);
}

/**
 * Obtém ou cria registro do usuário
 */
function getUsuario(telefone) {
  if (!contadores.usuarios.has(telefone)) {
    contadores.usuarios.set(telefone, {
      mensagens: [],
      gemini: [],
      bloqueadoAte: null,
      mensagensRecentes: [], // Para detectar spam
    });
  }
  return contadores.usuarios.get(telefone);
}

/**
 * Verifica se o usuário está bloqueado
 */
function estaBloqueado(telefone) {
  // Bloqueio permanente
  if (NUMEROS_BLOQUEADOS.has(telefone)) {
    return { bloqueado: true, motivo: 'Número bloqueado permanentemente', permanente: true };
  }

  const usuario = getUsuario(telefone);

  // Bloqueio temporário
  if (usuario.bloqueadoAte && Date.now() < usuario.bloqueadoAte) {
    const minutosRestantes = Math.ceil((usuario.bloqueadoAte - Date.now()) / 60000);
    return {
      bloqueado: true,
      motivo: `Muitas mensagens. Tente novamente em ${minutosRestantes} minutos.`,
      permanente: false,
    };
  }

  // Limpa bloqueio expirado
  if (usuario.bloqueadoAte) {
    usuario.bloqueadoAte = null;
  }

  return { bloqueado: false };
}

/**
 * Registra uma mensagem e verifica limites
 * @returns {{ permitido: boolean, motivo?: string, usarGemini: boolean }}
 */
function verificarMensagem(telefone, textoMensagem) {
  const bloqueio = estaBloqueado(telefone);
  if (bloqueio.bloqueado) {
    return { permitido: false, motivo: bloqueio.motivo, usarGemini: false };
  }

  const usuario = getUsuario(telefone);
  const agora = Date.now();

  // Limpa timestamps antigos
  usuario.mensagens = limparAntigos(usuario.mensagens, 60); // última hora
  usuario.gemini = limparAntigos(usuario.gemini, 60);

  // Conta mensagens no último minuto
  const msgUltimoMinuto = usuario.mensagens.filter(t => t > agora - 60000).length;

  // Verifica limite por minuto
  if (msgUltimoMinuto >= CONFIG.MENSAGENS_POR_MINUTO) {
    // Bloqueia temporariamente
    usuario.bloqueadoAte = agora + (CONFIG.TEMPO_BLOQUEIO * 60 * 1000);
    console.log(`[RateLimit] Usuário ${telefone} bloqueado por excesso de mensagens`);
    return {
      permitido: false,
      motivo: `Você enviou muitas mensagens. Aguarde ${CONFIG.TEMPO_BLOQUEIO} minutos.`,
      usarGemini: false,
    };
  }

  // Verifica limite por hora
  if (usuario.mensagens.length >= CONFIG.MENSAGENS_POR_HORA) {
    return {
      permitido: false,
      motivo: 'Limite de mensagens por hora atingido. Tente mais tarde.',
      usarGemini: false,
    };
  }

  // Detecta spam (mensagens iguais seguidas)
  usuario.mensagensRecentes.push(textoMensagem);
  if (usuario.mensagensRecentes.length > CONFIG.MENSAGENS_IGUAIS_SEGUIDAS) {
    usuario.mensagensRecentes.shift();
  }

  const todasIguais = usuario.mensagensRecentes.length >= CONFIG.MENSAGENS_IGUAIS_SEGUIDAS &&
    usuario.mensagensRecentes.every(m => m === textoMensagem);

  if (todasIguais) {
    usuario.bloqueadoAte = agora + (CONFIG.TEMPO_BLOQUEIO * 60 * 1000);
    console.log(`[RateLimit] Usuário ${telefone} bloqueado por spam`);
    return {
      permitido: false,
      motivo: 'Detectamos mensagens repetidas. Aguarde alguns minutos.',
      usarGemini: false,
    };
  }

  // Registra mensagem
  usuario.mensagens.push(agora);

  return { permitido: true, usarGemini: true };
}

/**
 * Verifica se pode usar o Gemini (limites específicos da API)
 * @returns {{ permitido: boolean, motivo?: string }}
 */
function verificarGemini(telefone) {
  const usuario = getUsuario(telefone);
  const agora = Date.now();

  // Limpa timestamps antigos
  usuario.gemini = limparAntigos(usuario.gemini, 60);
  contadores.global.gemini = limparAntigos(contadores.global.gemini, 60);

  // Verifica limite global por minuto
  const globalUltimoMinuto = contadores.global.gemini.filter(t => t > agora - 60000).length;
  if (globalUltimoMinuto >= CONFIG.GEMINI_GLOBAL_POR_MINUTO) {
    console.log('[RateLimit] Limite global do Gemini atingido');
    return {
      permitido: false,
      motivo: 'Sistema ocupado. Sua mensagem será respondida em breve.',
    };
  }

  // Verifica limite global por hora
  if (contadores.global.gemini.length >= CONFIG.GEMINI_GLOBAL_POR_HORA) {
    return {
      permitido: false,
      motivo: 'Sistema em alta demanda. Tente novamente mais tarde.',
    };
  }

  // Verifica limite do usuário por minuto
  const userUltimoMinuto = usuario.gemini.filter(t => t > agora - 60000).length;
  if (userUltimoMinuto >= CONFIG.GEMINI_POR_MINUTO) {
    return {
      permitido: false,
      motivo: 'Aguarde um momento antes de enviar outra mensagem.',
    };
  }

  // Verifica limite do usuário por hora
  if (usuario.gemini.length >= CONFIG.GEMINI_POR_HORA) {
    return {
      permitido: false,
      motivo: 'Você atingiu o limite de mensagens por hora.',
    };
  }

  // Registra uso
  usuario.gemini.push(agora);
  contadores.global.gemini.push(agora);

  return { permitido: true };
}

/**
 * Bloqueia um número permanentemente
 */
function bloquearNumero(telefone) {
  NUMEROS_BLOQUEADOS.add(telefone);
  console.log(`[RateLimit] Número ${telefone} bloqueado permanentemente`);
}

/**
 * Desbloqueia um número
 */
function desbloquearNumero(telefone) {
  NUMEROS_BLOQUEADOS.delete(telefone);
  const usuario = getUsuario(telefone);
  usuario.bloqueadoAte = null;
  console.log(`[RateLimit] Número ${telefone} desbloqueado`);
}

/**
 * Retorna estatísticas de uso
 */
function getEstatisticas() {
  return {
    usuariosAtivos: contadores.usuarios.size,
    geminiUltimaHora: contadores.global.gemini.length,
    bloqueadosPermanente: NUMEROS_BLOQUEADOS.size,
  };
}

/**
 * Limpa contadores antigos (chamar periodicamente)
 */
function limparContadores() {
  const agora = Date.now();
  const umaHoraAtras = agora - (60 * 60 * 1000);

  for (const [telefone, usuario] of contadores.usuarios) {
    usuario.mensagens = usuario.mensagens.filter(t => t > umaHoraAtras);
    usuario.gemini = usuario.gemini.filter(t => t > umaHoraAtras);

    // Remove usuários inativos há mais de 1 hora
    if (usuario.mensagens.length === 0 && usuario.gemini.length === 0 && !usuario.bloqueadoAte) {
      contadores.usuarios.delete(telefone);
    }
  }

  contadores.global.gemini = contadores.global.gemini.filter(t => t > umaHoraAtras);
}

// Limpa contadores a cada 10 minutos
setInterval(limparContadores, 10 * 60 * 1000);

module.exports = {
  CONFIG,
  verificarMensagem,
  verificarGemini,
  estaBloqueado,
  bloquearNumero,
  desbloquearNumero,
  getEstatisticas,
  NUMEROS_BLOQUEADOS,
};
