/**
 * Respostas automáticas para economizar chamadas ao Gemini
 * Retorna null se não houver resposta automática (vai para o Gemini)
 */

// Normaliza texto para comparação
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/g, '') // remove pontuação
    .trim();
}

// Verifica se texto contém alguma das palavras
function contem(texto, palavras) {
  const normalizado = normalizar(texto);
  return palavras.some(p => normalizado.includes(normalizar(p)));
}

// Verifica se texto é exatamente uma das opções
function igualA(texto, opcoes) {
  const normalizado = normalizar(texto);
  return opcoes.some(op => normalizado === normalizar(op));
}

// ============================================
// RESPOSTAS AUTOMÁTICAS
// ============================================

const SAUDACOES = {
  palavras: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'eae', 'eai', 'salve', 'fala'],
  resposta: (hora) => {
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    return `${saudacao}! 👋 Aqui é o André, da JP empresa Teste!

Trabalho com:
🛋️ Limpeza de sofá
❄️ Higienização de ar-condicionado

Como posso te ajudar hoje? 😊`;
  }
};

const PRECO_VALOR = {
  palavras: ['quanto custa', 'qual o preco', 'qual o valor', 'quanto fica', 'quanto e', 'quanto sai', 'tabela de preco', 'valores', 'orcamento', 'quero orcamento', 'fazer orcamento', 'pedir orcamento'],
  resposta: `Claro! 😄 Aqui estão meus preços base:

*🛋️ Limpeza de Sofá:*
- Poltrona: R$ 80
- 2 lugares: R$ 120
- 3 lugares: R$ 150
- 4 lugares: R$ 200
- 5 lugares: R$ 250
- 6+ lugares: R$ 300

*❄️ Ar-Condicionado:*
- Split: R$ 120
- Janela: R$ 80
- Cassete: R$ 180

⚠️ Pode ter adicional por material (couro +R$30), manchas difíceis (+R$30) ou pet em casa (+R$25). O valor final confirmo após ver pessoalmente.

Me conta o que você precisa! 👇`
};

const SOFA_INTERESSE = {
  palavras: ['limpar sofa', 'limpeza de sofa', 'lavar sofa', 'higienizar sofa', 'sofa sujo', 'limpar o sofa', 'limpeza sofa'],
  resposta: `Ótimo! 🛋️ Faço limpeza profissional de sofá.

💰 Os preços base são:
- Poltrona: R$ 80
- 2 lugares: R$ 120
- 3 lugares: R$ 150
- 4+ lugares: a partir de R$ 200

Para te dar o valor certinho, me conta:
1️⃣ Quantos lugares tem o sofá?
2️⃣ É de tecido ou couro?
3️⃣ Tem manchas difíceis?
4️⃣ Tem pets em casa? 🐾

Se preferir, manda uma foto do sofá! 📸`
};

const AR_INTERESSE = {
  palavras: ['limpar ar', 'limpeza de ar', 'higienizar ar', 'ar condicionado', 'ar-condicionado', 'split', 'limpeza ar'],
  resposta: `Perfeito! ❄️ Faço higienização de ar-condicionado.

💰 Os preços base são:
- Split: R$ 120
- Janela: R$ 80
- Cassete: R$ 180
- Piso-teto: R$ 150

Me conta:
1️⃣ Qual o tipo do seu?
2️⃣ Sabe quantos BTUs?
3️⃣ Quando foi a última limpeza?

Assim te passo o valor certinho! 😉`
};

const AMBOS_INTERESSE = {
  palavras: ['sofa e ar', 'ar e sofa', 'os dois', 'ambos', 'tudo', 'completo'],
  resposta: `Show! 🔥 Posso fazer os dois serviços.

Me conta sobre o *🛋️ sofá*:
- Quantos lugares? Tecido ou couro?

E sobre o *❄️ ar-condicionado*:
- Qual tipo? (split, janela, cassete)

Fazendo os dois juntos, geralmente consigo um precinho melhor! 💪`
};

const FORMAS_PAGAMENTO = {
  palavras: ['forma de pagamento', 'como pagar', 'aceita pix', 'aceita cartao', 'parcelamento', 'parcela', 'pix', 'cartao'],
  resposta: `Aceitamos 💳:

✅ PIX (na hora)
✅ Dinheiro
✅ Cartão de débito
✅ Cartão de crédito

Para cartão de crédito, me consulte sobre condições de parcelamento! 😊`
};

const ENDERECO_ATENDIMENTO = {
  palavras: ['onde fica', 'endereco', 'localizacao', 'qual regiao', 'atende em', 'vai ate', 'regiao de atendimento'],
  resposta: `Atendo em domicílio! 🏠 Vou até você.

Qual seu endereço/bairro? Assim confirmo se atendo na sua região! 📍`
};

const TEMPO_SERVICO = {
  palavras: ['quanto tempo demora', 'quanto tempo leva', 'demora muito', 'tempo de servico', 'dura quanto', 'quanto tempo dura'],
  resposta: `⏱️ O tempo varia conforme o serviço:

*🛋️ Sofá:*
- 2 lugares: ~40 min
- 3 lugares: ~1 hora
- 4+ lugares: ~1h30

*❄️ Ar-condicionado:*
- Split simples: ~1 hora
- Mais unidades: consultar

Confirmo o tempo exato no orçamento! 😉`
};

const AGENDAMENTO = {
  palavras: ['agendar', 'marcar', 'quando pode', 'data disponivel', 'horario disponivel', 'disponibilidade'],
  resposta: `📅 Para agendar, me diz:

1️⃣ Qual serviço? (sofá, ar ou ambos)
2️⃣ Qual dia da semana é melhor?
3️⃣ Prefere manhã ou tarde?

Vou verificar minha agenda e te confirmo! ✅`
};

const GARANTIA = {
  palavras: ['tem garantia', 'garantia', 'se nao ficar bom', 'resultado garantido'],
  resposta: `Sim! ✅ Trabalho com garantia de satisfação.

Se após o serviço você identificar algo que não ficou bom, é só chamar que volto para ajustar, sem custo adicional.

Meu objetivo é você ficar 100% satisfeito! 💯`
};

const PRODUTOS = {
  palavras: ['que produto usa', 'produto quimico', 'e seguro', 'seguro para crianca', 'seguro para pet', 'produto utilizado'],
  resposta: `Uso produtos profissionais e seguros! 🧴

✅ Biodegradáveis
✅ Seguros para crianças e pets 🐾
✅ Sem cheiro forte
✅ Secagem rápida

Após a limpeza, recomendo aguardar ~2 horas antes de usar o sofá. O ar pode ligar normalmente após o serviço. 👍`
};

const SERVICOS_INFO = {
  palavras: ['o que voce faz', 'o que voces fazem', 'quais servicos', 'que servico', 'como funciona', 'me ajudar', 'pode me ajudar', 'o que oferece', 'o que oferecem'],
  resposta: `Trabalho com dois serviços principais:

*🛋️ Limpeza de Sofá*
- Limpeza profunda
- Remoção de manchas
- Higienização completa

*❄️ Ar-Condicionado*
- Higienização
- Limpeza de filtros
- Manutenção preventiva

Qual serviço te interessa? 😊`
};

const AGRADECIMENTO = {
  palavras: ['obrigado', 'obrigada', 'valeu', 'muito obrigado', 'agradeco', 'thanks', 'vlw'],
  resposta: `Por nada! 😊 Fico à disposição.

Se precisar de algo mais, é só chamar aqui. Até mais! 👋`
};

const TCHAU = {
  palavras: ['tchau', 'ate mais', 'ate logo', 'falou', 'flw', 'bye', 'adeus'],
  resposta: `Até mais! 👋

Quando precisar de limpeza de sofá ou ar-condicionado, é só chamar.

André - JP empresa Teste 💪`
};

const OK_CONFIRMACAO = {
  palavras: ['ok', 'okay', 'beleza', 'certo', 'entendi', 'blz', 'perfeito', 'show', 'otimo'],
  resposta: null // Não responde automaticamente, deixa o fluxo continuar
};

// Lista de todas as respostas automáticas (em ordem de prioridade)
const RESPOSTAS = [
  AGRADECIMENTO,
  TCHAU,
  PRECO_VALOR,
  SOFA_INTERESSE,
  AR_INTERESSE,
  AMBOS_INTERESSE,
  FORMAS_PAGAMENTO,
  ENDERECO_ATENDIMENTO,
  TEMPO_SERVICO,
  AGENDAMENTO,
  GARANTIA,
  PRODUTOS,
  SERVICOS_INFO, // Perguntas sobre serviços
  SAUDACOES, // Saudações por último (são mais genéricas)
];

/**
 * Verifica se a mensagem parece ser uma resposta com dados/informações
 * Essas devem ir para o Gemini processar
 */
function pareceRespostaComDados(mensagem) {
  const texto = normalizar(mensagem);

  // Contém números (provavelmente está informando quantidade, lugares, BTUs, etc)
  if (/\d/.test(mensagem)) {
    return true;
  }

  // Palavras que indicam resposta com informação específica
  const palavrasInfo = [
    'lugares', 'lugar', 'tecido', 'couro', 'veludo', 'sintetico',
    'manchas', 'manchado', 'sujo', 'suja',
    'btus', 'btu', 'split', 'janela', 'cassete',
    'sim tenho', 'nao tenho', 'tem sim', 'tem nao',
    'moro', 'fica na', 'fica no', 'rua', 'avenida', 'bairro',
    'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo',
    'manha', 'tarde', 'noite'
  ];

  return palavrasInfo.some(p => texto.includes(p));
}

/**
 * Busca resposta automática para a mensagem
 * @param {string} mensagem - Mensagem do cliente
 * @param {object} contexto - Contexto do cliente (opcional)
 * @returns {string|null} - Resposta automática ou null para usar Gemini
 */
function buscarRespostaAutomatica(mensagem, contexto = {}) {
  if (!mensagem || mensagem.length > 200) {
    // Mensagens muito longas provavelmente precisam do Gemini
    return null;
  }

  const textoNormalizado = normalizar(mensagem);

  // Ignora confirmações simples (deixa o Gemini decidir baseado no contexto)
  if (igualA(mensagem, ['ok', 'okay', 'sim', 'nao', 'não', 's', 'n', 'beleza', 'blz', 'certo'])) {
    return null;
  }

  // Se parece ser uma resposta com dados, manda pro Gemini processar
  if (pareceRespostaComDados(mensagem)) {
    return null;
  }

  // Busca resposta automática
  for (const item of RESPOSTAS) {
    if (contem(mensagem, item.palavras)) {
      if (typeof item.resposta === 'function') {
        const hora = new Date().getHours();
        return item.resposta(hora);
      }
      return item.resposta;
    }
  }

  return null; // Usa Gemini
}

/**
 * Verifica se deve ignorar a mensagem completamente
 * @param {string} mensagem
 * @returns {boolean}
 */
function deveIgnorar(mensagem) {
  const ignorar = ['👍', '👎', '😊', '😀', '🙏', '❤️', 'kk', 'kkk', 'haha', 'rs', 'rsrs'];
  return ignorar.includes(normalizar(mensagem));
}

module.exports = {
  buscarRespostaAutomatica,
  deveIgnorar,
  normalizar,
};
