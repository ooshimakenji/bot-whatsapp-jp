require('dotenv').config();
const express = require('express');
const { connectWhatsApp } = require('./services/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  connectWhatsApp();
});
