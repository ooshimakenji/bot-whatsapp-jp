const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');

const SSM_PATH = '/bot-whatsapp-jp/';

/**
 * Carrega parâmetros do AWS SSM Parameter Store e seta como process.env
 * Só executa se estiver na EC2 (NODE_ENV=production)
 * Em dev local, usa .env normalmente
 */
async function carregarParametrosSSM() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Ambiente local detectado, usando .env');
    return;
  }

  console.log('Buscando parâmetros do SSM Parameter Store...');

  try {
    const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new GetParametersByPathCommand({
      Path: SSM_PATH,
      WithDecryption: true,
    });

    const response = await client.send(command);

    if (!response.Parameters || response.Parameters.length === 0) {
      console.warn('Nenhum parâmetro encontrado no SSM. Usando .env como fallback.');
      return;
    }

    for (const param of response.Parameters) {
      // /bot-whatsapp-jp/GROQ_API_KEY → GROQ_API_KEY
      const nome = param.Name.replace(SSM_PATH, '');
      process.env[nome] = param.Value;
    }

    console.log(`${response.Parameters.length} parâmetros carregados do SSM.`);
  } catch (error) {
    console.warn('Falha ao buscar SSM, usando .env como fallback:', error.message);
  }
}

module.exports = { carregarParametrosSSM };
