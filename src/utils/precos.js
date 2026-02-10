/**
 * Tabela de preços base - JP empresa Teste
 *
 * NOTA: Estes são valores BASE para referência.
 * O André pode ajustar conforme a situação real.
 */

const PRECOS_SOFA = {
  // Por número de lugares
  lugares: {
    1: 80,    // Poltrona
    2: 120,   // 2 lugares
    3: 150,   // 3 lugares
    4: 200,   // 4 lugares (ou L pequeno)
    5: 250,   // 5 lugares (L médio)
    6: 300,   // 6+ lugares (L grande)
  },

  // Adicional por material
  material: {
    tecido: 0,
    couro: 30,      // +R$30 para couro
    sintetico: 15,  // +R$15 para sintético
  },

  // Adicional por estado
  estado: {
    bom: 0,
    medio: 20,      // +R$20 sujeira média
    ruim: 50,       // +R$50 muito sujo
  },

  // Adicional por manchas difíceis
  manchas: {
    nao: 0,
    sim: 30,        // +R$30 tratamento de manchas
  },

  // Adicional se tem pet
  pet: 25,          // +R$25 (pelos, odores)
};

const PRECOS_AR = {
  // Por modelo
  modelo: {
    split: 120,
    janela: 80,
    cassete: 180,
    piso_teto: 150,
  },

  // Adicional por estado
  estado: {
    bom: 0,
    medio: 20,
    ruim: 40,
  },
};

/**
 * Calcula estimativa de preço do sofá
 * @param {object} dados - Dados extraídos da análise
 * @returns {object} - { minimo, maximo, detalhes }
 */
function calcularPrecoSofa(dados) {
  let preco = 0;
  const detalhes = [];

  // Base por lugares
  const lugares = parseInt(dados.lugares) || 3;
  const lugaresKey = Math.min(lugares, 6);
  preco += PRECOS_SOFA.lugares[lugaresKey] || PRECOS_SOFA.lugares[3];
  detalhes.push(`${lugares} lugares: R$ ${PRECOS_SOFA.lugares[lugaresKey]}`);

  // Material
  const material = dados.material?.toLowerCase() || 'tecido';
  if (PRECOS_SOFA.material[material]) {
    preco += PRECOS_SOFA.material[material];
    if (PRECOS_SOFA.material[material] > 0) {
      detalhes.push(`Material ${material}: +R$ ${PRECOS_SOFA.material[material]}`);
    }
  }

  // Estado
  const estado = dados.estado?.toLowerCase() || 'bom';
  if (PRECOS_SOFA.estado[estado]) {
    preco += PRECOS_SOFA.estado[estado];
    if (PRECOS_SOFA.estado[estado] > 0) {
      detalhes.push(`Estado ${estado}: +R$ ${PRECOS_SOFA.estado[estado]}`);
    }
  }

  // Manchas
  const temManchas = dados.manchas === 'sim';
  if (temManchas) {
    preco += PRECOS_SOFA.manchas.sim;
    detalhes.push(`Tratamento de manchas: +R$ ${PRECOS_SOFA.manchas.sim}`);
  }

  // Pet (se informado)
  if (dados.tem_pet) {
    preco += PRECOS_SOFA.pet;
    detalhes.push(`Limpeza extra (pet): +R$ ${PRECOS_SOFA.pet}`);
  }

  return {
    minimo: preco,
    maximo: Math.round(preco * 1.2), // +20% margem
    detalhes,
  };
}

/**
 * Calcula estimativa de preço do ar-condicionado
 * @param {object} dados - Dados extraídos da análise
 * @returns {object} - { minimo, maximo, detalhes }
 */
function calcularPrecoAr(dados) {
  let preco = 0;
  const detalhes = [];

  // Base por modelo
  const modelo = dados.modelo_ar?.toLowerCase() || 'split';
  preco += PRECOS_AR.modelo[modelo] || PRECOS_AR.modelo.split;
  detalhes.push(`${modelo}: R$ ${PRECOS_AR.modelo[modelo]}`);

  // Estado
  const estado = dados.estado?.toLowerCase() || 'bom';
  if (PRECOS_AR.estado[estado]) {
    preco += PRECOS_AR.estado[estado];
    if (PRECOS_AR.estado[estado] > 0) {
      detalhes.push(`Estado ${estado}: +R$ ${PRECOS_AR.estado[estado]}`);
    }
  }

  return {
    minimo: preco,
    maximo: Math.round(preco * 1.2),
    detalhes,
  };
}

/**
 * Extrai dados da tag [ANALISE: ...] da resposta do Gemini
 * @param {string} texto - Resposta completa do Gemini
 * @returns {object|null} - Dados extraídos ou null
 */
function extrairAnaliseImagem(texto) {
  const match = texto.match(/\[ANALISE:\s*([^\]]+)\]/i);
  if (!match) return null;

  const dados = {};
  const pares = match[1].split(',').map(p => p.trim());

  for (const par of pares) {
    const [chave, valor] = par.split('=').map(s => s.trim());
    if (chave && valor && valor !== 'none' && valor !== 'X') {
      dados[chave] = valor;
    }
  }

  return dados;
}

/**
 * Remove a tag [ANALISE: ...] do texto para enviar ao cliente
 * @param {string} texto
 * @returns {string}
 */
function limparAnaliseParaCliente(texto) {
  return texto.replace(/\[ANALISE:[^\]]+\]/gi, '').trim();
}

/**
 * Gera mensagem de estimativa de preço
 * @param {object} dados - Dados da análise
 * @returns {string|null} - Mensagem ou null se não tiver dados suficientes
 */
function gerarMensagemEstimativa(dados) {
  if (!dados || !dados.tipo) return null;

  if (dados.tipo === 'sofa' && dados.lugares) {
    const estimativa = calcularPrecoSofa(dados);
    return `\n\n💰 Estimativa de preço:* R$ ${estimativa.minimo} - R$ ${estimativa.maximo}\n_(valor final confirmo após ver pessoalmente ✅)_`;
  }

  if (dados.tipo === 'ar_condicionado' && dados.modelo_ar) {
    const estimativa = calcularPrecoAr(dados);
    return `\n\n💰 Estimativa de preço:* R$ ${estimativa.minimo} - R$ ${estimativa.maximo}\n_(valor final confirmo após ver pessoalmente ✅)_`;
  }

  return null;
}

module.exports = {
  PRECOS_SOFA,
  PRECOS_AR,
  calcularPrecoSofa,
  calcularPrecoAr,
  extrairAnaliseImagem,
  limparAnaliseParaCliente,
  gerarMensagemEstimativa,
};
