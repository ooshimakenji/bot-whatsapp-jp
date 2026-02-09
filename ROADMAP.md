# ROADMAP - Bot WhatsApp JP empresa Teste

## Objetivo Final
Bot de WhatsApp automatizado para a JP empresa Teste que:
- Atende clientes 24/7 com IA (Gemini)
- Coleta informações para orçamento
- Analisa fotos de sofás e ar-condicionados
- Agenda visitas automaticamente
- Envia lembretes de serviços
- Dispara promoções automáticas (6 meses e anual)

---

## FASE 1: SETUP INICIAL
- [x] 1.1 Criar estrutura do projeto Node.js
- [x] 1.2 Configurar package.json com dependências
- [x] 1.3 Criar .env.example e .gitignore
- [x] 1.4 Configurar nodemon para desenvolvimento

**Status: CONCLUÍDO**

---

## FASE 2: INFRAESTRUTURA
- [x] 2.1 Criar conexão básica WhatsApp (Baileys)
- [x] 2.2 Implementar QR code para autenticação
- [x] 2.3 Configurar reconexão automática
- [x] 2.4 Criar cliente Supabase
- [x] 2.5 Criar cliente Gemini

**Status: CONCLUÍDO**

---

## FASE 3: BANCO DE DADOS
- [x] 3.1 Criar schema SQL (tabelas)
- [ ] 3.2 Criar projeto no Supabase
- [ ] 3.3 Executar schema.sql no Supabase
- [ ] 3.4 Testar conexão com banco

**Status: PARCIAL - Schema criado, falta executar no Supabase**

---

## FASE 4: MODELS (CRUD)
- [x] 4.1 Model de clientes
- [x] 4.2 Model de serviços
- [x] 4.3 Model de orçamentos
- [x] 4.4 Model de histórico
- [x] 4.5 Model de promoções

**Status: CONCLUÍDO**

---

## FASE 5: INTELIGÊNCIA ARTIFICIAL
- [x] 5.1 Criar prompt do sistema (personalidade do bot)
- [x] 5.2 Implementar chat com histórico
- [x] 5.3 Implementar análise de imagens
- [x] 5.4 Criar extração de intenções
- [ ] 5.5 Testar respostas do Gemini
- [ ] 5.6 Ajustar prompts conforme necessário

**Status: PARCIAL - Código pronto, falta testar e ajustar**

---

## FASE 6: CONTROLLER DO BOT
- [x] 6.1 Handler de mensagens de texto
- [x] 6.2 Handler de imagens
- [x] 6.3 Integração com histórico
- [x] 6.4 Extração automática de dados do cliente
- [ ] 6.5 Handler de áudio (transcrição)
- [ ] 6.6 Handler de localização (endereço)

**Status: PARCIAL - Texto e imagem prontos, áudio pendente**

---

## FASE 7: AGENDAMENTO AUTOMÁTICO
- [x] 7.1 Configurar node-cron
- [x] 7.2 Lembrete 1 dia antes
- [x] 7.3 Lembrete 1 hora antes
- [x] 7.4 Promoção 6 meses (30%)
- [x] 7.5 Promoção anual (15%)
- [ ] 7.6 Testar disparo de lembretes
- [ ] 7.7 Testar disparo de promoções

**Status: PARCIAL - Código pronto, falta testar**

---

## FASE 8: TESTES E AJUSTES <<<< ESTAMOS AQUI
- [ ] 8.1 Configurar variáveis de ambiente (.env)
- [ ] 8.2 Criar banco no Supabase e executar SQL
- [ ] 8.3 Obter API key do Gemini
- [ ] 8.4 Primeiro teste de conexão WhatsApp
- [ ] 8.5 Testar fluxo completo de conversa
- [ ] 8.6 Testar envio/recebimento de imagens
- [ ] 8.7 Ajustar prompts do Gemini
- [ ] 8.8 Testar agendamento de serviço

**Status: NÃO INICIADO**

---

## FASE 9: MELHORIAS (FUTURO)
- [ ] 9.1 Dashboard admin para André
- [ ] 9.2 Transcrição de áudios (Whisper API)
- [ ] 9.3 Integração com Google Calendar
- [ ] 9.4 Relatórios mensais automáticos
- [ ] 9.5 Avaliação pós-serviço
- [ ] 9.6 Sistema de indicação de clientes
- [ ] 9.7 Deploy em servidor (Railway/Render)

**Status: FUTURO**

---

## RESUMO DO PROGRESSO

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Setup Inicial | ✅ 100% |
| 2 | Infraestrutura | ✅ 100% |
| 3 | Banco de Dados | ⏳ 50% |
| 4 | Models | ✅ 100% |
| 5 | Inteligência Artificial | ⏳ 70% |
| 6 | Controller do Bot | ⏳ 80% |
| 7 | Agendamento | ⏳ 70% |
| 8 | Testes e Ajustes | ❌ 0% |
| 9 | Melhorias | ❌ 0% |

**Progresso Geral: ~60%**

---

## PRÓXIMO PASSO IMEDIATO

1. Criar conta/projeto no Supabase
2. Executar `database/schema.sql`
3. Pegar API key do Gemini
4. Preencher `.env`
5. Rodar `npm run dev`
6. Escanear QR code
7. Testar mandando mensagem para o bot
