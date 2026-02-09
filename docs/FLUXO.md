# FLUXO DO BOT - JP empresa Teste

## Visão Geral

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────>│  WhatsApp   │────>│     Bot     │────>│   Gemini    │
│  (WhatsApp) │<────│  (Baileys)  │<────│  (Node.js)  │<────│    (IA)     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
                                        ┌─────────────┐
                                        │  Supabase   │
                                        │    (DB)     │
                                        └─────────────┘
```

---

## FLUXO PRINCIPAL: Mensagem Recebida

```
CLIENTE ENVIA MENSAGEM
        │
        v
┌───────────────────────────────────────┐
│ 1. WhatsApp recebe mensagem           │
│    (sock.ev.on 'messages.upsert')     │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 2. Validações iniciais                │
│    - É mensagem própria? IGNORA       │
│    - É grupo? IGNORA                  │
│    - É status? IGNORA                 │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 3. Identifica tipo de mensagem        │
│    - texto ──────> processarTexto()   │
│    - imagem ─────> processarImagem()  │
│    - audio ──────> "prefiro texto"    │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 4. Busca/Cria cliente no Supabase     │
│    SELECT * FROM clientes             │
│    WHERE telefone = ?                 │
│    (se não existe, INSERT)            │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 5. Salva mensagem no histórico        │
│    INSERT INTO historico              │
│    (cliente_id, role='user', msg)     │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 6. Busca contexto do cliente          │
│    - Nome, endereço                   │
│    - Serviço pendente                 │
│    - Promoções ativas                 │
│    - Últimas 20 mensagens             │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 7. CHAMA API DO GEMINI                │  <─── AQUI ENTRA A IA
│                                       │
│    Envia:                             │
│    - System prompt (personalidade)    │
│    - Contexto do cliente              │
│    - Histórico da conversa            │
│    - Mensagem atual                   │
│                                       │
│    Recebe:                            │
│    - Resposta natural                 │
│    - [INFO: dados extraídos]          │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 8. Processa resposta do Gemini        │
│    - Extrai [INFO: ...] se houver     │
│    - Atualiza dados do cliente        │
│    - Cria serviço se identificado     │
│    - Remove [INFO] da resposta        │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 9. Salva resposta no histórico        │
│    INSERT INTO historico              │
│    (cliente_id, role='assistant', msg)│
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 10. Envia resposta ao cliente         │
│     sock.sendMessage(jid, {text})     │
└───────────────────────────────────────┘
```

---

## FLUXO DE IMAGEM

```
CLIENTE ENVIA FOTO
        │
        v
┌───────────────────────────────────────┐
│ 1. Baixa imagem do WhatsApp           │
│    sock.downloadMediaMessage()        │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 2. Converte para Base64               │
│    buffer.toString('base64')          │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 3. CHAMA GEMINI COM IMAGEM            │  <─── IA ANALISA FOTO
│                                       │
│    Envia:                             │
│    - Prompt de análise                │
│    - Imagem em base64                 │
│                                       │
│    Recebe:                            │
│    - Descrição do sofá/ar             │
│    - Estado de conservação            │
│    - Manchas visíveis                 │
│    - Observações para orçamento       │
└───────────────────────────────────────┘
        │
        v
┌───────────────────────────────────────┐
│ 4. Envia análise ao cliente           │
└───────────────────────────────────────┘
```

---

## FLUXO DE AGENDAMENTO (CRON)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SCHEDULER (node-cron)                     │
└─────────────────────────────────────────────────────────────────┘

TODO DIA ÀS 9H:
┌───────────────────────────────────────┐
│ Lembrete 1 dia antes                  │
│                                       │
│ 1. Busca serviços agendados p/ amanhã │
│ 2. Para cada serviço:                 │
│    - Monta mensagem de lembrete       │
│    - Envia para o cliente             │
└───────────────────────────────────────┘

A CADA HORA:
┌───────────────────────────────────────┐
│ Lembrete 1 hora antes                 │
│                                       │
│ 1. Busca serviços na próxima hora     │
│ 2. Para cada serviço:                 │
│    - Monta mensagem "André a caminho" │
│    - Envia para o cliente             │
└───────────────────────────────────────┘

TODO DIA ÀS 10H:
┌───────────────────────────────────────┐
│ Promoções automáticas                 │
│                                       │
│ 1. Busca clientes sem serviço há 6m   │
│    - Cria cupom 30% desconto          │
│    - Envia mensagem promocional       │
│                                       │
│ 2. Busca clientes sem serviço há 1ano │
│    - Cria cupom 15% desconto          │
│    - Envia mensagem promocional       │
└───────────────────────────────────────┘
```

---

## EXEMPLO DE CONVERSA REAL

```
CLIENTE: Oi, boa tarde!
    │
    └──> Gemini recebe: "Oi, boa tarde!"
         Contexto: cliente novo, sem histórico
    │
    └──> Gemini responde:
         "Boa tarde! Bem-vindo à JP empresa Teste!
          Trabalhamos com limpeza de sofá e higienização
          de ar-condicionado. Como posso ajudar?"

CLIENTE: Quero limpar meu sofá
    │
    └──> Gemini recebe: "Quero limpar meu sofá"
         Contexto: cliente novo
    │
    └──> Gemini responde:
         "Ótimo! Para passar o orçamento, preciso de
          algumas informações:

          - Quantos lugares tem o sofá?
          - É de tecido ou couro?
          - Tem manchas ou sujeira específica?
          - Tem pets em casa?

          Se quiser, pode mandar uma foto!"

         [INFO: servico=sofa]

CLIENTE: 3 lugares, tecido, tenho um cachorro
    │
    └──> Gemini recebe: "3 lugares, tecido, tenho um cachorro"
         Contexto: serviço pendente (sofá)
    │
    └──> Gemini responde:
         "Perfeito! Sofá de 3 lugares em tecido, com pet.

          Qual o endereço para a visita?"

         [INFO: lugares=3, material=tecido, tem_pet=sim]

CLIENTE: Rua das Flores, 123 - Centro
    │
    └──> Gemini recebe: "Rua das Flores, 123 - Centro"
         Contexto: coletando dados
    │
    └──> Gemini responde:
         "Anotado! O André vai analisar as informações
          e te enviar o orçamento em breve.

          Quer agendar uma data para a visita?"

         [INFO: endereco=Rua das Flores 123 Centro]

CLIENTE: Pode ser sábado de manhã?
    │
    └──> Gemini recebe: "Pode ser sábado de manhã?"
    │
    └──> Gemini responde:
         "Sábado de manhã está ótimo!
          Vou reservar o horário das 9h.

          O André confirma com você assim que
          enviar o orçamento.

          Algo mais que posso ajudar?"
```

---

## FLUXO DE DADOS NO BANCO

```
CLIENTES                 SERVICOS                 ORCAMENTOS
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ id           │───┐    │ id           │───┐    │ id           │
│ nome         │   │    │ cliente_id   │◄──┘    │ servico_id   │◄──┘
│ telefone     │   │    │ tipo         │        │ valor        │
│ endereco     │   │    │ status       │        │ sinal_pago   │
│ tem_pet      │   │    │ descricao    │        │ saldo        │
│ aniversario  │   │    │ data_visita  │        │ aprovado     │
└──────────────┘   │    └──────────────┘        └──────────────┘
                   │
                   │    HISTORICO               PROMOCOES
                   │    ┌──────────────┐        ┌──────────────┐
                   │    │ id           │        │ id           │
                   └───>│ cliente_id   │◄───────│ cliente_id   │
                        │ role         │        │ tipo         │
                        │ mensagem     │        │ desconto     │
                        │ created_at   │        │ codigo       │
                        └──────────────┘        │ validade     │
                                                └──────────────┘
```

---

## RESUMO: QUANDO O GEMINI É CHAMADO

| Situação | Função | O que faz |
|----------|--------|-----------|
| Mensagem de texto | `gerarResposta()` | Responde naturalmente com contexto |
| Imagem recebida | `analisarImagem()` | Descreve sofá/ar para orçamento |
| Extração de dados | `extrairIntencao()` | Identifica intenção e dados (opcional) |

---

## ARQUIVOS ENVOLVIDOS

```
src/
├── services/
│   └── whatsapp.js      # Recebe mensagem, dispara fluxo
│   └── gemini.js        # Chama API do Gemini
│   └── scheduler.js     # Lembretes e promoções
├── controllers/
│   └── botController.js # Orquestra todo o fluxo
├── models/
│   └── *.js             # CRUD no Supabase
└── utils/
    └── prompts.js       # Prompts do Gemini
```
