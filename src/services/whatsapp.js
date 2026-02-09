const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');
const { handleMessage } = require('../controllers/botController');
const { iniciarScheduler } = require('./scheduler');

const AUTH_FOLDER = path.join(__dirname, '..', '..', 'auth_info');

let sockInstance = null;

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  // Adiciona método para baixar mídia
  sock.downloadMediaMessage = (msg) => downloadMediaMessage(msg, 'buffer', {});

  sockInstance = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n========================================');
      console.log('Escaneie o QR code abaixo com seu WhatsApp:');
      console.log('========================================\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log('Conexão fechada.', shouldReconnect ? 'Reconectando...' : 'Deslogado.');

      if (shouldReconnect) {
        connectWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('\n========================================');
      console.log('Bot JP empresa Teste conectado!');
      console.log('========================================\n');

      // Inicia o scheduler de lembretes e promoções
      iniciarScheduler(sock);
    }
  });

  // Handler principal de mensagens
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      await handleMessage(sock, msg);
    }
  });

  return sock;
}

function getSock() {
  return sockInstance;
}

module.exports = { connectWhatsApp, getSock };
