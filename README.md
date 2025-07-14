# 📺 TV Dashboard - Professional Edition

Sistema profissional para monitoramento de múltiplos canais de TV com configurações avançadas de servidor e deploy automático via GitHub Actions.

[![Deploy to Fly.io](https://github.com/mikusher/tv-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/mikusher/tv-dashboard/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://tv-dashboard.fly.dev/)

## 🌐 Deploy Automático

O projeto possui integração contínua com GitHub Actions que faz deploy automático no Fly.io a cada commit na branch main.

**🔗 Acesso Direto:** https://tv-dashboard.fly.dev/

## 🚀 Execução Super Simples com Makefile

### ⚡ **Comandos Principais**
```bash
# Ver todos os comandos disponíveis
make help

# Desenvolvimento local
make dev              # Servidor local porta 8080
make dev PORT=3000    # Servidor local porta customizada

# Docker (Produção)
make docker           # Build + run + health check
make up               # Iniciar containers
make down             # Parar containers

# Monitoramento
make status           # Status dos containers
make health           # Health check
make test             # Teste completo da aplicação
make logs             # Logs em tempo real
```

### 🔧 **Setup Rápido**
```bash
# Primeira vez
git clone <repo>
cd tv-dashboard
make docker          # Setup completo automático!
```

## 📋 **Todos os Comandos Makefile**

### 🔧 **Desenvolvimento Local**
```bash
make install          # Copiar .env
make dev              # Servidor local
make build            # Build para dist/
make start            # Alias para make dev
```

### 🐳 **Docker**
```bash
make docker           # Build + run completo
make up               # Iniciar containers
make down             # Parar containers  
make restart          # Reiniciar containers
make logs             # Ver logs (-f)
```

### 📊 **Monitoramento**
```bash
make status           # Status + uso de recursos
make health           # Health check
make test             # Teste completo (página + health + headers)
make deploy           # Deploy + teste automático
```

### 🧹 **Limpeza**
```bash
make clean            # Limpar builds + containers
make clean-all        # Limpeza completa (networks, volumes)
```

### ⚡ **Atalhos Rápidos**
```bash
make d                # = make docker
make u                # = make up  
make s                # = make status
make l                # = make logs
make h                # = make health
make c                # = make clean
```

## ⚙️ Configurações Profissionais

### Arquivo `.env` - Configuração Completa

#### 🏗️ **Aplicação**
```env
APP_NAME="TV Dashboard"
APP_VERSION="1.0.0"
APP_ENV="production"  # production|development
```

#### 🌐 **Servidor & Nginx**
```env
PORT=8080  # Porta externa
NGINX_WORKER_CONNECTIONS=1024
NGINX_CLIENT_MAX_BODY_SIZE=100M
NGINX_KEEPALIVE_TIMEOUT=65
NGINX_GZIP_ENABLED=on
```

#### 🎯 **TV Streaming**
```env
STREAM_CONNECTION_TIMEOUT=30
STREAM_MAX_RETRIES=3
STREAM_RETRY_DELAY=5000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS="*"
```

#### 🔒 **Segurança**
```env
SECURITY_HEADERS_ENABLED=true
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION="1; mode=block"
SERVER_TOKENS=off
```

#### 📊 **Cache & Performance**
```env
STATIC_ASSETS_CACHE=1y
HTML_CACHE_CONTROL="no-cache, no-store, must-revalidate"
NGINX_GZIP_ENABLED=on
```

#### 📝 **Logging**
```env
LOG_LEVEL=info
LOG_FORMAT=combined
LOG_ACCESS_ENABLED=true
LOG_ERROR_ENABLED=true
```

#### 🔧 **Traefik (Proxy Reverso)**
```env
TRAEFIK_ENABLE=true
TRAEFIK_DOMAIN=tv-dashboard.local
TRAEFIK_SERVICE_PORT=80
```

### 🎮 **Configurações da Aplicação**
```env
DEFAULT_GRID_LAYOUT=4x4     # 2x2|3x3|4x4
DEFAULT_THEME=dark          # dark|light
DEFAULT_AUTOPLAY=muted      # muted|off
DEFAULT_VOLUME=1.0          # 0.0-1.0
DEFAULT_LANGUAGE=pt         # pt|en
```

## 📁 Estrutura
```
tv-dashboard/
├── index.html              # Interface principal
├── favicon.ico             # Ícone do site
├── css/styles.css          # Estilos
├── js/                     # Scripts JavaScript
│   ├── script.js           # Lógica principal
│   ├── channels.js         # Gestão de canais
│   ├── storage.js          # Armazenamento local
│   └── config.js           # Configurações
├── env.example             # Configurações completas
├── docker-compose.yml      # Orquestração Docker
├── Dockerfile              # Container nginx profissional
├── Makefile                # Comandos automatizados
└── dist/                   # Build (gerado)
```

## 🎯 Funcionalidades

### 📺 **Core TV Features**
- ✅ **Múltiplos streams** simultâneos (até 16)
- ✅ **Canais pré-configurados** (PT, UK)
- ✅ **Gestão completa** de canais customizados
- ✅ **Controlo de áudio** individual
- ✅ **Layouts flexíveis** (2x2, 3x3, 4x4)

### 🔧 **Funcionalidades Profissionais**
- ✅ **Headers de segurança** completos
- ✅ **CORS configurável** para streams externos
- ✅ **Cache otimizado** para performance
- ✅ **Logs estruturados** e rotativos
- ✅ **Health checks** automáticos
- ✅ **Gzip compression** automática
- ✅ **Suporte Traefik** para proxy reverso

### 🛡️ **Segurança**
- ✅ **Headers XSS protection**
- ✅ **Content-Type sniffing protection**
- ✅ **Frame options** configuráveis
- ✅ **Server tokens** ocultos
- ✅ **Access logs** detalhados

## 🚀 Deploy em Produção

### 🐳 **Docker com Traefik**
```bash
# Configurar no .env
TRAEFIK_ENABLE=true
TRAEFIK_DOMAIN=tv.example.com

# Deploy
make docker
```

### ☁️ **Fly.io (Recomendado - Free)**
```bash
# Setup completo automático
make fly-setup

# Ou manual:
make fly-install    # Instalar CLI
make fly-auth       # Login
make fly-create     # Criar app
make fly-deploy     # Deploy
make fly-open       # Abrir browser
```

**Vantagens Fly.io:**
- ✅ **Free tier**: 256MB RAM (usa apenas 7.6MB!)
- ✅ **Global CDN**: Edge locations mundiais
- ✅ **HTTPS automático**: Certificados SSL gratuitos
- ✅ **Deploy simples**: 1 comando
- ✅ **Monitoramento**: Health checks automáticos

📖 **Guia completo**: [FLY-DEPLOY.md](FLY-DEPLOY.md)

### 🖥️ **Servidor Tradicional**
```bash
# 1. Copiar arquivos
scp -r . user@server:/var/www/tv-dashboard/

# 2. Deploy
make docker
```

## 📊 Monitoramento

### 🔍 **Health Check**
```bash
make health
# ou
curl http://localhost:8080/health
```

### 📝 **Logs**
```bash
make logs           # Logs em tempo real
make status         # Status + recursos
```

### 📈 **Testes Automáticos**
```bash
make test           # Teste completo:
                    # - Página principal (200)
                    # - Health endpoint (200) 
                    # - Headers de segurança
```

## 🎯 **Fluxos de Trabalho Comuns**

### 👨‍💻 **Desenvolvimento**
```bash
make dev            # Desenvolvimento local
# Editar código...
make build          # Build para dist/
```

### 🚀 **Deploy Rápido**
```bash
make deploy         # Build + run + test automático
```

### 🐛 **Debug**
```bash
make status         # Ver status
make logs           # Ver logs
make health         # Testar saúde
```

### 🧹 **Limpeza**
```bash
make clean          # Limpeza básica
make clean-all      # Limpeza completa
```

## 🔄 GitHub Actions CI/CD

### 📋 **Workflow Automático**

O projeto possui um workflow GitHub Actions que:

1. **🔍 Trigger**: Ativa em commits para `main` ou `master`
2. **🚀 Deploy**: Faz deploy automático no Fly.io
3. **✅ Tests**: Executa testes de health check
4. **📊 Status**: Atualiza badges no README

### 🔧 **Configuração GitHub**

```bash
# 1. Criar repositório no GitHub
gh repo create tv-dashboard --public

# 2. Adicionar remote
git remote add origin https://github.com/mikusher/tv-dashboard.git

# 3. Configurar secrets (necessário)
# No GitHub: Settings → Secrets → Actions
# Adicionar: FLY_API_TOKEN (token do Fly.io)

# 4. Primeiro push
git add .
git commit -m "🚀 Initial commit - TV Dashboard"
git push -u origin main
```

### 🔑 **Secrets Necessários**

Para o GitHub Actions funcionar, configure:

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `FLY_API_TOKEN` | `fly_xxxxx` | Token de autenticação do Fly.io |

**Obter token Fly.io:**
```bash
fly auth token
```

### 📈 **Monitoramento Deploy**

- **Actions**: https://github.com/mikusher/tv-dashboard/actions
- **Live Site**: https://tv-dashboard.fly.dev/
- **Health Check**: https://tv-dashboard.fly.dev/health

## 📝 Notas Técnicas

- **🎬 Otimizado para TV**: Headers CORS e timeouts específicos para streams
- **🔄 CI/CD**: Deploy automático a cada commit
- **🌐 Global**: CDN e edge locations via Fly.io
- **⚡ Performance**: Gzip, cache, e nginx tuning profissional  
- **🔒 Segurança**: Headers completos e proteções ativas
- **📦 Containerizado**: Docker com configuração dinâmica via ENV
- **🔧 Configurável**: 50+ variáveis de ambiente para personalização
- **🌐 Proxy-ready**: Suporte nativo para Traefik e nginx-proxy
- **⚡ Makefile**: Automação completa de desenvolvimento e deploy

---
*Sistema profissional de monitoramento de TV com automação total via Makefile.* 