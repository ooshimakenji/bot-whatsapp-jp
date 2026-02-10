# Deploy na AWS EC2

## 1. Criar instância EC2

### No console AWS (https://console.aws.amazon.com/ec2):

1. **Launch Instance**
2. Nome: `bot-whatsapp-jp`
3. AMI: **Ubuntu 24.04 LTS** (Free tier eligible)
4. Tipo: **t2.micro** (Free tier)
5. Key pair: Criar novo → nome `bot-whatsapp-jp` → Download `.pem`
6. Security Group: criar novo com regras:
   - SSH (porta 22) - Seu IP
   - HTTP (porta 3000) - Anywhere (para health check)
7. Storage: 8 GB gp3 (padrão)
8. **Launch**

### Salvar a key:
```bash
# Linux/Mac
mv ~/Downloads/bot-whatsapp-jp.pem ~/.ssh/
chmod 400 ~/.ssh/bot-whatsapp-jp.pem

# Windows (PowerShell)
Move-Item ~\Downloads\bot-whatsapp-jp.pem ~\.ssh\
```

## 2. Conectar via SSH

```bash
# Pegue o IP público na aba "Instances" do console EC2
ssh -i ~/.ssh/bot-whatsapp-jp.pem ubuntu@SEU_IP_PUBLICO
```

Windows (PowerShell):
```powershell
ssh -i $env:USERPROFILE\.ssh\bot-whatsapp-jp.pem ubuntu@SEU_IP_PUBLICO
```

## 3. Instalar dependências no servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node -v
npm -v

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar git (geralmente já vem)
sudo apt install -y git
```

## 4. Clonar o projeto

```bash
cd ~
git clone https://github.com/ooshimakenji/bot-whatsapp-jp.git
cd bot-whatsapp-jp
npm install
```

## 5. Configurar variáveis de ambiente

```bash
nano .env
```

Colar o conteúdo:
```
GROQ_API_KEY=sua_chave_groq
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
PORT=3000
```

Salvar: `Ctrl+O`, `Enter`, `Ctrl+X`

## 6. Iniciar com PM2

```bash
# Iniciar
pm2 start ecosystem.config.js

# Verificar se está rodando
pm2 status

# Ver logs (aqui aparece o QR code!)
pm2 logs bot-whatsapp-jp

# Escanear o QR code com WhatsApp
# Após conectar, a sessão fica salva em auth_info/

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
```

## 7. Comandos úteis do dia a dia

```bash
# Ver logs em tempo real
pm2 logs bot-whatsapp-jp

# Reiniciar bot
pm2 restart bot-whatsapp-jp

# Parar bot
pm2 stop bot-whatsapp-jp

# Ver status
pm2 status

# Ver uso de memória/CPU
pm2 monit
```

## 8. Atualizar código (após git push)

```bash
cd ~/bot-whatsapp-jp
git pull
npm install
pm2 restart bot-whatsapp-jp
```

## 9. Se perder a sessão do WhatsApp

A sessão fica em `~/bot-whatsapp-jp/auth_info/`. Se precisar reconectar:

```bash
# Remove sessão antiga
rm -rf ~/bot-whatsapp-jp/auth_info/

# Reinicia o bot (vai gerar novo QR)
pm2 restart bot-whatsapp-jp

# Acompanha os logs pra ver o QR
pm2 logs bot-whatsapp-jp
```

## 10. Health check

Testar se o servidor está respondendo:
```bash
curl http://localhost:3000/health
# Deve retornar: {"status":"ok"}
```

De fora (usando IP público):
```
http://SEU_IP_PUBLICO:3000/health
```
