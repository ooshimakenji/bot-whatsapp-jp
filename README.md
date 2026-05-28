# Bot WhatsApp — JP Empresa

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) ![Groq](https://img.shields.io/badge/Groq-Llama-F54F3B?logo=groq&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white) ![Baileys](https://img.shields.io/badge/Baileys-WhatsApp-25D366?logo=whatsapp&logoColor=white) ![Licença](https://img.shields.io/badge/licença-ISC-blue)

Bot de WhatsApp para atendimento automatizado de clientes, integrado ao Groq (Llama) para conversas naturais, análise de imagens e agendamento de visitas.

## Funcionalidades

- Atendimento automatizado 24 horas com IA (Gemini)
- Respostas automáticas para perguntas frequentes
- Análise de imagens (sofá, ar-condicionado) com estimativa de preço
- Coleta de dados do cliente para geração de orçamento
- Agendamento automático de visitas
- Lembretes automáticos (1 dia e 1 hora antes do horário)
- Campanhas promocionais automáticas (6 meses e anual)
- Rate limiting para proteção contra abuso

## Stack

- **Node.js** — Runtime
- **Baileys** — API não-oficial do WhatsApp (sem Puppeteer)
- **Groq** — IA para conversação (Llama 3.1 8B) e análise de imagens (Llama 3.2 90B Vision)
- **Supabase** — Banco de dados PostgreSQL
- **Express** — Servidor HTTP com endpoint `/health`
- **node-cron** — Agendamento de tarefas

## Estrutura

```
src/
├── index.js              # Entry point
├── controllers/
│   └── botController.js  # Lógica de mensagens
├── models/
│   ├── cliente.js        # CRUD clientes
│   ├── servico.js        # CRUD serviços
│   ├── orcamento.js      # CRUD orçamentos
│   ├── historico.js      # Histórico de mensagens
│   └── promocao.js       # Promoções
├── services/
│   ├── groq.js           # Integração Groq (texto + visão)
│   ├── supabase.js       # Cliente Supabase
│   ├── whatsapp.js       # Conexão WhatsApp
│   └── scheduler.js      # Agendamentos (cron)
└── utils/
    ├── prompts.js        # Prompts e persona do bot
    ├── helpers.js        # Funções auxiliares
    ├── precos.js         # Tabela de preços
    ├── rateLimit.js      # Proteção contra abuso
    └── respostasAutomaticas.js

database/
└── schema.sql            # SQL para criar as tabelas
```

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/ooshimakenji/bot-whatsapp-jp.git
cd bot-whatsapp-jp
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute `database/schema.sql`
3. Copie a URL e a ANON KEY em **Settings > API**

### 4. Configure o Groq

1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma API Key e copie

### 5. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
GROQ_API_KEY=sua_chave_groq
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_supabase
```

### 6. Execute

```bash
npm run dev    # desenvolvimento com hot reload (nodemon)
npm start      # produção
```

### 7. Conecte o WhatsApp

Escaneie o QR code exibido no terminal com o WhatsApp que será usado como bot.

A sessão é salva em `auth_info/` — não é necessário escanear novamente após a primeira conexão.

## Uso

Após conectar, o bot responde automaticamente a:

- **Saudações** → Resposta automática
- **Perguntas sobre preço** → Coleta informações do cliente
- **Envio de fotos** → Analisa e fornece estimativa de preço
- **Agendamento** → Registra a visita no banco de dados

## Reconexão Automática

O bot reconecta automaticamente em caso de queda de conexão. A sessão é encerrada somente se o dispositivo for desvinculado manualmente pelo WhatsApp.

## Rate Limiting

| Tipo | Por minuto | Por hora |
|------|------------|----------|
| Mensagens/usuário | 10 | 60 |
| Gemini/usuário | 5 | 30 |
| Gemini global | 30 | 500 |

## Tabela de Preços Base

### Sofá

| Lugares | Preço |
|---------|-------|
| 1 (poltrona) | R$ 80 |
| 2 | R$ 120 |
| 3 | R$ 150 |
| 4 | R$ 200 |
| 5 | R$ 250 |
| 6+ | R$ 300 |

Adicionais: Couro (+R$ 30), Manchas (+R$ 30), Pelos de pet (+R$ 25)

### Ar-condicionado

| Tipo | Preço |
|------|-------|
| Split | R$ 120 |
| Janela | R$ 80 |
| Cassete | R$ 180 |
| Piso-teto | R$ 150 |

## Licença

ISC

## Contribuindo / Contributing

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.  
Contributions are welcome! Feel free to open an issue or submit a pull request.
