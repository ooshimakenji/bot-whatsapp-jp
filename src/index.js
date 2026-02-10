require('dotenv').config();
const { connectWhatsApp } = require('./services/whatsapp');

console.log('Iniciando bot WhatsApp JP...');
connectWhatsApp();
