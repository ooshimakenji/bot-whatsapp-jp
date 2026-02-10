require('dotenv').config();
const { carregarParametrosSSM } = require('./services/ssm');
const { connectWhatsApp } = require('./services/whatsapp');

async function iniciar() {
  await carregarParametrosSSM();
  console.log('Iniciando bot WhatsApp JP...');
  connectWhatsApp();
}

iniciar();
