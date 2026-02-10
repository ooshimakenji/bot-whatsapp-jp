# Bot WhatsApp JP - Contexto do Projeto

## O que é
Bot de WhatsApp para a **JP empresa Teste** (limpeza de sofá e higienização de ar-condicionado). O bot **finge ser o André**, dono da empresa, respondendo em primeira pessoa.

## Stack
- **Runtime:** Node.js
- **WhatsApp:** Baileys
- **IA:** Groq API (Llama 3.1 8B para texto, Llama 3.2 90B Vision para imagens)
- **Banco:** Supabase (clientes, histórico, serviços, promoções)
- **Deploy:** Ainda não feito - próximo passo é subir na AWS EC2

## Arquitetura
- `src/controllers/botController.js` - Handler principal de mensagens
- `src/services/groq.js` - Integração com Groq (texto + visão de imagens)
- `src/services/supabase.js` - Cliente Supabase
- `src/models/` - Queries do Supabase (clientes, histórico, serviços)
- `src/utils/prompts.js` - SYSTEM_PROMPT (André), prompts de análise de imagem, templates de lembrete/promoção
- `src/utils/respostasAutomaticas.js` - Respostas fixas para economizar tokens (saudações, preços, etc.)
- `src/utils/precos.js` - Tabela de preços e cálculo de estimativas

## Decisões importantes
- **Bot = André:** Nunca se referir ao André em terceira pessoa. Tudo em primeira pessoa.
- **Preços informados ao cliente:** O bot informa estimativas de preço baseadas na tabela em precos.js
- **Respostas automáticas SEMPRE ativas:** Mesmo com serviço pendente, saudações/preços/etc usam resposta fixa (não gasta tokens)
- **Histórico Groq:** Limitado a 10 mensagens das últimas 24h (economia de tokens)
- **Visão de imagens:** Usa modelo `llama-3.2-90b-vision-preview` via Groq para analisar fotos de sofá/ar
- **Serviços pendentes nunca expiram:** Cliente pode voltar dias depois e retomar

## Estado atual (mudanças não commitadas)
- prompts.js: Bot como André + tabela de preços no SYSTEM_PROMPT
- groq.js (novo): Substituiu gemini.js como IA principal, com suporte a visão
- respostasAutomaticas.js: Preços nas respostas, emojis, voz do André
- botController.js: Auto respostas sempre ativas, log corrigido Gemini→Groq
- historico.js: Limite 10 msgs + filtro 24h
- precos.js: Mensagens em 1ª pessoa

## Próximos passos
- [ ] Commitar e pushar mudanças pro GitHub
- [ ] Deploy na AWS EC2 (free tier, t2.micro/t3.micro, usar PM2)
- [ ] Configurar variáveis de ambiente na EC2 (.env com GROQ_API_KEY, SUPABASE_URL, etc.)

## Preferências do usuário
- Sempre perguntar antes de implementar mudanças
- Ser econômico com tokens do Claude Code (menos leituras, respostas curtas)
- Foco em aprendizado - o usuário quer aprender AWS para currículo
