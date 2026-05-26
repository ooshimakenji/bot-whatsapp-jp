# Bot WhatsApp — JP Empresa

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white) ![Baileys](https://img.shields.io/badge/Baileys-WhatsApp-25D366?logo=whatsapp&logoColor=white) ![Licença](https://img.shields.io/badge/licença-ISC-blue)

Bot de WhatsApp automatizado para atendimento de clientes, com integração de IA (Google Gemini) para conversação natural, análise de imagens e agendamento automático.

## Funcionalidades

- Atendimento automático 24/7 com IA (Gemini)
- Respostas automáticas para perguntas frequentes
- Análise de imagens (sofá, ar-condicionado) com estimativa de preço
- Coleta de dados do cliente para orçamento
- Agendamento automático de visitas
- Lembretes automáticos (1 dia e 1 hora antes)
- Promoções automáticas (6 meses e anual)
- Rate limiting para proteção contra abuso

## Stack

- **Node.js** — Runtime
- **Baileys** — API não oficial do WhatsApp
- **Google Gemini** — IA para conversação e análise de imagens
- **Supabase** — Banco de dados PostgreSQL
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
│   ├── gemini.js         # Integração Gemini
│   ├── supabase.js       # Cliente Supabase
│   ├── whatsapp.js       # Conexão WhatsApp
│   └── scheduler.js      # Agendamentos (cron)
└── utils/
    ├── prompts.js        # Prompts do Gemini
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

### 4. Configure o Gemini

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Clique em **Get API Key** e copie a chave

### 5. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
GEMINI_API_KEY=sua_chave_gemini
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_supabase
```

### 6. Execute

```bash
npm run dev
```

### 7. Conecte o WhatsApp

Escaneie o QR Code exibido no terminal com o WhatsApp que será usado como bot.

## Uso

Após conectar, o bot responde automaticamente:

- **Saudações** → Resposta automática
- **Perguntas sobre preço** → Coleta informações do cliente
- **Envio de fotos** → Analisa e fornece estimativa
- **Agendamento** → Registra no banco de dados

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

Adicionais: Couro (+R$ 30), Manchas (+R$ 30), Pet (+R$ 25)

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
