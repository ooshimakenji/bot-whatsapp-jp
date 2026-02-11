require('dotenv').config();
const { carregarParametrosSSM } = require('./services/ssm');
const { connectWhatsApp } = require('./services/whatsapp');

const VARIAVEIS_OBRIGATORIAS = ['GROQ_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];

function validarVariaveis() {
  const faltando = VARIAVEIS_OBRIGATORIAS.filter(v => !process.env[v]);

  if (faltando.length > 0) {
    console.error('ERRO: Variáveis de ambiente obrigatórias não encontradas:');
    faltando.forEach(v => console.error(`  - ${v}`));
    console.error('\nConfigure no .env (local) ou SSM Parameter Store (produção).');
    process.exit(1);
  }
}

async function iniciar() {
  await carregarParametrosSSM();
  validarVariaveis();
  console.log('Iniciando bot WhatsApp JP...');
  connectWhatsApp();
}

iniciar();
