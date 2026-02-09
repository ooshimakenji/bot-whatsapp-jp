# Bot WhatsApp - JP empresa Teste

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

## Tecnologias

- **Node.js** - Runtime
- **Baileys** - API não-oficial do WhatsApp
- **Google Gemini** - IA para conversação e análise de imagens
- **Supabase** - Banco de dados PostgreSQL
- **node-cron** - Agendamento de tarefas

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
    └── respostasAutomaticas.js  # Respostas sem IA

database/
└── schema.sql            # SQL para criar tabelas
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
2. Vá em **SQL Editor**
3. Execute o conteúdo de `database/schema.sql`
4. Copie a URL e ANON KEY em **Settings > API**

### 4. Configure o Gemini

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Clique em **Get API Key**
3. Crie e copie a chave

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

1. Escaneie o QR code que aparece no terminal
2. Use o WhatsApp do celular que será o "bot"

## Uso

Após conectar, o bot responde automaticamente às mensagens:

- **Saudações** → Resposta automática
- **Perguntas sobre preço** → Coleta informações
- **Envio de fotos** → Analisa e dá estimativa
- **Agendamento** → Registra no banco

## Limites (Rate Limiting)

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

Adicionais: Couro (+R$30), Manchas (+R$30), Pet (+R$25)

### Ar-condicionado
| Tipo | Preço |
|------|-------|
| Split | R$ 120 |
| Janela | R$ 80 |
| Cassete | R$ 180 |
| Piso-teto | R$ 150 |

## Licença

ISC
