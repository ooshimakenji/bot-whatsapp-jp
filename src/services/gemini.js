const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT, ANALISE_IMAGEM_PROMPT } = require('../utils/prompts');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Gera resposta do chat com histórico de conversa
 * @param {string} mensagemUsuario - Mensagem atual do usuário
 * @param {Array} historicoConversa - Histórico no formato Gemini [{role, parts}]
 * @param {object} contextoCliente - Informações do cliente para contexto
 * @returns {Promise<string>} - Resposta do Gemini
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

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Sistema: ' + systemPromptCompleto }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido! Estou pronto para atender os clientes da JP empresa Teste de forma profissional e cordial.' }],
        },
        ...historicoConversa,
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(mensagemUsuario);
    const response = result.response;

    return response.text();
  } catch (error) {
    console.error('Erro ao gerar resposta do Gemini:', error);
    return 'Desculpe, estou com dificuldades técnicas no momento. O André entrará em contato em breve!';
  }
}

/**
 * Analisa imagem enviada pelo cliente
 * @param {Buffer} imagemBuffer - Buffer da imagem
 * @param {string} mimeType - Tipo da imagem (image/jpeg, image/png, etc)
 * @returns {Promise<string>} - Descrição da imagem
 */
async function analisarImagem(imagemBuffer, mimeType = 'image/jpeg') {
  try {
    const imagemBase64 = imagemBuffer.toString('base64');

    const result = await model.generateContent([
      ANALISE_IMAGEM_PROMPT,
      {
        inlineData: {
          mimeType,
          data: imagemBase64,
        },
      },
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Erro ao analisar imagem:', error);
    return 'Recebi sua foto! O André vai analisar e incluir no orçamento.';
  }
}

/**
 * Extrai intenção/entidades da mensagem
 * @param {string} mensagem
 * @returns {Promise<object>}
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

    const result = await model.generateContent(prompt);
    const texto = result.response.text();

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
  model,
  gerarResposta,
  analisarImagem,
  extrairIntencao,
};
