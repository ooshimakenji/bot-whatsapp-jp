const { SYSTEM_PROMPT, ANALISE_IMAGEM_PROMPT } = require('../utils/prompts');

// Modelo do Llama a ser usado
const MODELO = 'llama-3.1-8b-instant';
const MODELO_VISAO = 'llama-3.2-90b-vision-preview';

/**
 * Faz chamada à API do Groq
 */
async function chamarGroq(messages, maxTokens = 500, modelo = MODELO) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelo,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Gera resposta do chat com histórico de conversa
 * @param {string} mensagemUsuario - Mensagem atual do usuário
 * @param {Array} historicoConversa - Histórico no formato [{role, parts}]
 * @param {object} contextoCliente - Informações do cliente para contexto
 * @returns {Promise<string>} - Resposta do Groq/Llama
 */
async function gerarResposta(mensagemUsuario, historicoConversa = [], contextoCliente = {}) {
  try {
    // Monta contexto adicional
    let contextoExtra = '';
    if (contextoCliente.nome) {
      contextoExtra += `\nNome do cliente: ${contextoCliente.nome}`;
    }
    if (contextoCliente.servicoPendente) {
      contextoExtra += `\nServiço pendente: ${contextoCliente.servicoPendente.tipo} - Status: ${contextoCliente.servicoPendente.status}`;
    }
    if (contextoCliente.promocoesAtivas && contextoCliente.promocoesAtivas.length > 0) {
      contextoExtra += `\nPromoções ativas: ${contextoCliente.promocoesAtivas.map(p => `${p.desconto}% (código: ${p.codigo})`).join(', ')}`;
    }

    const systemPromptCompleto = SYSTEM_PROMPT + contextoExtra;

    // Converte histórico do formato Gemini para formato OpenAI/Groq
    const messages = [
      { role: 'system', content: systemPromptCompleto },
    ];

    // Adiciona histórico convertido
    for (const msg of historicoConversa) {
      const role = msg.role === 'model' ? 'assistant' : msg.role;
      const content = msg.parts?.[0]?.text || '';
      if (content) {
        messages.push({ role, content });
      }
    }

    // Adiciona mensagem atual
    messages.push({ role: 'user', content: mensagemUsuario });

    const resposta = await chamarGroq(messages);
    return resposta;
  } catch (error) {
    console.error('Erro ao gerar resposta do Groq:', error);
    return 'Desculpe, estou com dificuldades técnicas no momento. Me chama de novo em alguns minutos!';
  }
}

/**
 * Analisa imagem enviada pelo cliente usando modelo de visão
 * @param {Buffer} imagemBuffer - Buffer da imagem
 * @param {string} mimeType - Tipo MIME da imagem
 * @returns {Promise<string>} - Análise da imagem com tag [ANALISE: ...]
 */
async function analisarImagem(imagemBuffer, mimeType = 'image/jpeg') {
  try {
    const base64Image = imagemBuffer.toString('base64');

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: ANALISE_IMAGEM_PROMPT,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ];

    const resposta = await chamarGroq(messages, 800, MODELO_VISAO);
    return resposta;
  } catch (error) {
    console.error('Erro ao analisar imagem com Groq Vision:', error);
    return 'Recebi sua foto! Me descreve o que tem na imagem? Por exemplo: quantos lugares tem o sofá, material, se tem manchas, etc. Assim consigo te passar uma estimativa de preço!';
  }
}

/**
 * Extrai intenção/entidades da mensagem
 */
async function extrairIntencao(mensagem) {
  try {
    const prompt = `Analise esta mensagem de um cliente e extraia as informações em JSON:
Mensagem: "${mensagem}"

Retorne APENAS um JSON válido com:
{
  "intencao": "orcamento" | "agendamento" | "duvida" | "cancelamento" | "saudacao" | "outro",
  "servico": "sofa" | "ar_condicionado" | "ambos" | null,
  "dados_extraidos": {
    "nome": string | null,
    "endereco": string | null,
    "data_preferencia": string | null,
    "lugares_sofa": number | null,
    "tem_pet": boolean | null
  }
}`;

    const messages = [
      { role: 'system', content: 'Você é um assistente que extrai informações de mensagens. Responda apenas com JSON válido.' },
      { role: 'user', content: prompt },
    ];

    const texto = await chamarGroq(messages, 300);

    // Tenta extrair JSON da resposta
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { intencao: 'outro', servico: null, dados_extraidos: {} };
  } catch (error) {
    console.error('Erro ao extrair intencao:', error);
    return { intencao: 'outro', servico: null, dados_extraidos: {} };
  }
}

module.exports = {
  gerarResposta,
  analisarImagem,
  extrairIntencao,
  MODELO,
};
