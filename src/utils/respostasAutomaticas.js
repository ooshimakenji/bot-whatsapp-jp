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
    return `${saudacao}! Bem-vindo(a) à JP empresa Teste!

Trabalhamos com:
- Limpeza de sofá
- Higienização de ar-condicionado

Como posso te ajudar hoje?`;
  }
};

const PRECO_VALOR = {
  palavras: ['quanto custa', 'qual o preco', 'qual o valor', 'quanto fica', 'quanto e', 'quanto sai', 'tabela de preco', 'valores'],
  resposta: `Para passar um orçamento certinho, preciso de algumas informações:

Para *sofá*:
- Quantos lugares?
- Material (tecido ou couro)?
- Tem manchas?
- Tem pets?

Para *ar-condicionado*:
- Tipo (split, janela, cassete)?
- Quantos BTUs?

Me conta o que você precisa e te passo o valor!`
};

const SOFA_INTERESSE = {
  palavras: ['limpar sofa', 'limpeza de sofa', 'lavar sofa', 'higienizar sofa', 'sofa sujo', 'limpar o sofa', 'limpeza sofa'],
  resposta: `Ótimo! Fazemos limpeza profissional de sofá.

Para o orçamento, me conta:
1. Quantos lugares tem o sofá?
2. É de tecido ou couro?
3. Tem manchas difíceis?
4. Tem pets em casa?

Se preferir, manda uma foto do sofá!`
};

const AR_INTERESSE = {
  palavras: ['limpar ar', 'limpeza de ar', 'higienizar ar', 'ar condicionado', 'ar-condicionado', 'split', 'limpeza ar'],
  resposta: `Perfeito! Fazemos higienização de ar-condicionado.

Para o orçamento, me conta:
1. Qual o tipo? (split, janela, cassete)
2. Sabe quantos BTUs?
3. Quando foi a última limpeza?

Assim consigo te passar o valor certinho!`
};

const AMBOS_INTERESSE = {
  palavras: ['sofa e ar', 'ar e sofa', 'os dois', 'ambos', 'tudo', 'completo'],
  resposta: `Show! Podemos fazer os dois serviços.

Me conta sobre o *sofá*:
- Quantos lugares? Tecido ou couro?

E sobre o *ar-condicionado*:
- Qual tipo? (split, janela, cassete)

Fazendo os dois juntos, geralmente conseguimos um precinho melhor!`
};

const FORMAS_PAGAMENTO = {
  palavras: ['forma de pagamento', 'como pagar', 'aceita pix', 'aceita cartao', 'parcelamento', 'parcela', 'pix', 'cartao'],
  resposta: `Aceitamos:

- PIX (na hora)
- Dinheiro
- Cartão de débito
- Cartão de crédito

Para cartão de crédito, consulte condições de parcelamento com o André.`
};

const ENDERECO_ATENDIMENTO = {
  palavras: ['onde fica', 'endereco', 'localizacao', 'qual regiao', 'atende em', 'vai ate', 'regiao de atendimento'],
  resposta: `Atendemos em domicílio! Vamos até você.

Qual seu endereço/bairro? Assim confirmo se atendemos na sua região.`
};

const TEMPO_SERVICO = {
  palavras: ['quanto tempo demora', 'quanto tempo leva', 'demora muito', 'tempo de servico', 'dura quanto', 'quanto tempo dura'],
  resposta: `O tempo varia conforme o serviço:

*Sofá:*
- 2 lugares: ~40 min
- 3 lugares: ~1 hora
- 4+ lugares: ~1h30

*Ar-condicionado:*
- Split simples: ~1 hora
- Mais unidades: consultar

O André confirma o tempo exato no orçamento!`
};

const AGENDAMENTO = {
  palavras: ['agendar', 'marcar', 'quando pode', 'data disponivel', 'horario disponivel', 'disponibilidade'],
  resposta: `Para agendar, me diz:

1. Qual serviço? (sofá, ar ou ambos)
2. Qual dia da semana é melhor?
3. Prefere manhã ou tarde?

Vou verificar a agenda do André e te confirmo!`
};

const GARANTIA = {
  palavras: ['tem garantia', 'garantia', 'se nao ficar bom', 'resultado garantido'],
  resposta: `Sim! Trabalhamos com garantia de satisfação.

Se após o serviço você identificar algo que não ficou bom, é só chamar que voltamos para ajustar, sem custo adicional.

Nosso objetivo é você ficar 100% satisfeito!`
};

const PRODUTOS = {
  palavras: ['que produto usa', 'produto quimico', 'e seguro', 'seguro para crianca', 'seguro para pet', 'produto utilizado'],
  resposta: `Usamos produtos profissionais e seguros!

- Biodegradáveis
- Seguros para crianças e pets
- Sem cheiro forte
- Secagem rápida

Após a limpeza, recomendamos aguardar ~2 horas antes de usar o sofá. O ar pode ligar normalmente após o serviço.`
};

const AGRADECIMENTO = {
  palavras: ['obrigado', 'obrigada', 'valeu', 'muito obrigado', 'agradeco', 'thanks', 'vlw'],
  resposta: `Por nada! Fico à disposição.

Se precisar de algo mais, é só chamar aqui. Até mais!`
};

const TCHAU = {
  palavras: ['tchau', 'ate mais', 'ate logo', 'falou', 'flw', 'bye', 'adeus'],
  resposta: `Até mais!

Quando precisar de limpeza de sofá ou ar-condicionado, é só chamar.

JP empresa Teste - Sempre à disposição!`
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
  SAUDACOES, // Saudações por último (são mais genéricas)
];

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
