# ========================================
# TV Dashboard - Makefile
# ========================================

.PHONY: help install dev build docker up down logs clean status health test

# Variáveis
PORT ?= 8080
DOCKER_COMPOSE = docker-compose
DOCKER_IMAGE = tv-dashboard

# Cores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Help - comando padrão
help:
	@echo "$(BLUE)📺 TV Dashboard - Comandos Disponíveis$(NC)"
	@echo ""
	@echo "$(YELLOW)🔧 Desenvolvimento Local:$(NC)"
	@echo "  make dev          - Executar servidor local (porta $(PORT))"
	@echo "  make build        - Fazer build para dist/"
	@echo "  make install      - Copiar configurações (.env)"
	@echo ""
	@echo "$(YELLOW)🐳 Docker:$(NC)"
	@echo "  make docker       - Build e executar Docker"
	@echo "  make up           - Iniciar containers"
	@echo "  make down         - Parar containers"
	@echo "  make logs         - Ver logs em tempo real"
	@echo "  make restart      - Reiniciar containers"
	@echo ""
	@echo "$(YELLOW)📊 Monitoramento:$(NC)"
	@echo "  make status       - Status dos containers"
	@echo "  make health       - Health check"
	@echo "  make test         - Testar aplicação"
	@echo ""
	@echo "$(YELLOW)🧹 Limpeza:$(NC)"
	@echo "  make clean        - Limpar builds e containers"
	@echo "  make clean-all    - Limpeza completa (networks, volumes)"
	@echo ""
	@echo "$(YELLOW)🚁 Fly.io:$(NC)"
	@echo "  make fly-setup    - Setup completo Fly.io (install + auth + create + deploy)"
	@echo "  make fly-deploy   - Deploy no Fly.io"
	@echo "  make fly-status   - Status da aplicação"
	@echo "  make fly-logs     - Ver logs Fly.io"
	@echo ""
	@echo "$(YELLOW)🐙 GitHub CI/CD:$(NC)"
	@echo "  make github-setup - Configurar repositório GitHub"
	@echo "  make github-push  - Primeiro commit e push"
	@echo "  make git-deploy   - Commit + push (trigger deploy)"
	@echo "  make fly-token    - Obter token para GitHub Secrets"
	@echo "  make github-status- Ver status GitHub Actions"
	@echo ""
	@echo "$(YELLOW)📖 Exemplos:$(NC)"
	@echo "  make dev PORT=3000    - Servidor local na porta 3000"
	@echo "  make docker           - Deploy completo"

# ========================================
# Desenvolvimento Local
# ========================================

install:
	@echo "$(BLUE)📦 Instalando TV Dashboard...$(NC)"
	@if [ ! -f .env ]; then \
		cp env.example .env && \
		echo "$(GREEN)✅ Arquivo .env criado$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env já existe$(NC)"; \
	fi
	@echo "$(GREEN)✅ Instalação concluída$(NC)"

dev: install
	@echo "$(BLUE)🚀 Iniciando servidor local na porta $(PORT)...$(NC)"
	@echo "$(YELLOW)💡 Acesse: http://localhost:$(PORT)$(NC)"
	@echo "$(YELLOW)💡 Pressione Ctrl+C para parar$(NC)"
	@python3 -m http.server $(PORT)

build:
	@echo "$(BLUE)🔨 Fazendo build...$(NC)"
	@./build.sh
	@echo "$(GREEN)✅ Build concluído em ./dist/$(NC)"

# ========================================
# Docker
# ========================================

docker: install
	@echo "$(BLUE)🐳 Build e execução Docker completa...$(NC)"
	@$(DOCKER_COMPOSE) up --build -d
	@echo "$(GREEN)✅ Docker rodando em: http://localhost:8080$(NC)"
	@make health

up: install
	@echo "$(BLUE)🐳 Iniciando containers...$(NC)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Containers iniciados$(NC)"

down:
	@echo "$(BLUE)🛑 Parando containers...$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Containers parados$(NC)"

restart:
	@echo "$(BLUE)🔄 Reiniciando containers...$(NC)"
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Containers reiniciados$(NC)"

logs:
	@echo "$(BLUE)📝 Logs em tempo real (Ctrl+C para sair):$(NC)"
	@$(DOCKER_COMPOSE) logs -f

# ========================================
# Monitoramento
# ========================================

status:
	@echo "$(BLUE)📊 Status dos containers:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(BLUE)📊 Uso de recursos:$(NC)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || echo "Nenhum container rodando"

health:
	@echo "$(BLUE)🔍 Verificando saúde da aplicação...$(NC)"
	@sleep 2
	@if curl -s http://localhost:8080/health > /dev/null 2>&1; then \
		echo "$(GREEN)✅ Health check: OK$(NC)"; \
		echo "$(GREEN)✅ Aplicação disponível em: http://localhost:8080$(NC)"; \
	else \
		echo "$(RED)❌ Health check: FALHOU$(NC)"; \
		echo "$(YELLOW)💡 Tente: make logs$(NC)"; \
	fi

test: health
	@echo "$(BLUE)🧪 Testando aplicação...$(NC)"
	@echo "📄 Testando página principal..."
	@if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then \
		echo "$(GREEN)✅ Página principal: OK$(NC)"; \
	else \
		echo "$(RED)❌ Página principal: ERRO$(NC)"; \
	fi
	@echo "🔍 Testando health endpoint..."
	@if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health | grep -q "200"; then \
		echo "$(GREEN)✅ Health endpoint: OK$(NC)"; \
	else \
		echo "$(RED)❌ Health endpoint: ERRO$(NC)"; \
	fi
	@echo "📊 Testando headers de segurança..."
	@if curl -s -I http://localhost:8080/ | grep -q "X-Frame-Options"; then \
		echo "$(GREEN)✅ Headers de segurança: OK$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Headers de segurança: AUSENTES$(NC)"; \
	fi

# ========================================
# Limpeza
# ========================================

clean:
	@echo "$(BLUE)🧹 Limpando builds e containers...$(NC)"
	@$(DOCKER_COMPOSE) down 2>/dev/null || true
	@docker rmi $(DOCKER_IMAGE) 2>/dev/null || true
	@rm -rf dist/
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

clean-all: clean
	@echo "$(BLUE)🧹 Limpeza completa (networks, volumes, images)...$(NC)"
	@docker system prune -f 2>/dev/null || true
	@docker volume prune -f 2>/dev/null || true
	@docker network prune -f 2>/dev/null || true
	@echo "$(GREEN)✅ Limpeza completa concluída$(NC)"

# ========================================
# Fly.io Deployment
# ========================================

fly-install:
	@echo "$(BLUE)📦 Instalando Fly.io CLI...$(NC)"
	@if ! command -v flyctl >/dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  Fly.io CLI não encontrado. Instalando...$(NC)"; \
		curl -L https://fly.io/install.sh | sh; \
		echo "$(GREEN)✅ Fly.io CLI instalado$(NC)"; \
	else \
		echo "$(GREEN)✅ Fly.io CLI já instalado$(NC)"; \
	fi

fly-auth:
	@echo "$(BLUE)🔐 Autenticando no Fly.io...$(NC)"
	@flyctl auth login
	@echo "$(GREEN)✅ Autenticado no Fly.io$(NC)"

fly-create:
	@echo "$(BLUE)🚀 Criando app no Fly.io...$(NC)"
	@flyctl apps create tv-dashboard --name tv-dashboard
	@echo "$(GREEN)✅ App criado: tv-dashboard$(NC)"

fly-deploy:
	@echo "$(BLUE)🚀 Deploy para Fly.io...$(NC)"
	@flyctl deploy
	@echo "$(GREEN)✅ Deploy concluído!$(NC)"
	@echo "$(BLUE)💡 URL: https://tv-dashboard.fly.dev$(NC)"

fly-open:
	@echo "$(BLUE)🌍 Abrindo app no browser...$(NC)"
	@flyctl open

fly-status:
	@echo "$(BLUE)📊 Status do app no Fly.io...$(NC)"
	@flyctl status

fly-logs:
	@echo "$(BLUE)📋 Logs do app no Fly.io...$(NC)"
	@flyctl logs

fly-ssh:
	@echo "$(BLUE)🔌 Conectando via SSH...$(NC)"
	@flyctl ssh console

fly-destroy:
	@echo "$(RED)🗑️  Removendo app do Fly.io...$(NC)"
	@flyctl apps destroy tv-dashboard

# Deploy completo Fly.io
fly-setup: fly-install fly-auth fly-create fly-deploy fly-open
	@echo "$(GREEN)🎉 Setup completo Fly.io realizado!$(NC)"

# ========================================
# Targets especiais
# ========================================

# Deploy rápido (mais usado)
deploy: docker test
	@echo "$(GREEN)🚀 Deploy completo realizado com sucesso!$(NC)"

# Desenvolvimento rápido
start: dev

# ========================================
# GitHub e Git
# ========================================

# Inicializar repositório GitHub
github-init:
	@echo "$(BLUE)🔧 Configurando repositório GitHub...$(NC)"
	@if [ ! -d .git ]; then \
		git init; \
		echo "$(GREEN)✅ Git inicializado$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Git já está inicializado$(NC)"; \
	fi

# Adicionar remote GitHub
github-remote:
	@echo "$(BLUE)🔗 Configurando remote GitHub...$(NC)"
	@read -p "Username GitHub: " user; \
	read -p "Nome do repositório (tv-dashboard): " repo; \
	repo=$${repo:-tv-dashboard}; \
	git remote add origin https://github.com/$$user/$$repo.git || \
	git remote set-url origin https://github.com/$$user/$$repo.git
	@echo "$(GREEN)✅ Remote GitHub configurado$(NC)"

# Primeiro commit e push
github-push:
	@echo "$(BLUE)🚀 Fazendo primeiro commit...$(NC)"
	git add .
	git commit -m "🚀 Initial commit - TV Dashboard with Fly.io deploy"
	git branch -M main
	git push -u origin main
	@echo "$(GREEN)✅ Código enviado para GitHub$(NC)"

# Setup completo GitHub
github-setup: github-init github-remote
	@echo "$(YELLOW)📋 Próximos passos:$(NC)"
	@echo "1. Vá para GitHub → Settings → Secrets → Actions"
	@echo "2. Adicione: FLY_API_TOKEN com valor do 'fly auth token'"
	@echo "3. Execute: make github-push"

# Obter token Fly.io
fly-token:
	@echo "$(BLUE)🔑 Token Fly.io para GitHub Secrets:$(NC)"
	@fly auth token

# Deploy via git (simula GitHub Actions localmente)
git-deploy:
	@echo "$(BLUE)📤 Fazendo commit e push para trigger deploy...$(NC)"
	@read -p "Mensagem do commit: " msg; \
	git add .; \
	git commit -m "$$msg"; \
	git push
	@echo "$(GREEN)✅ Commit enviado - GitHub Actions irá fazer deploy$(NC)"

# Status do GitHub Actions
github-status:
	@echo "$(BLUE)📊 Verificando GitHub Actions...$(NC)"
	@echo "Acesse: https://github.com/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"

# ========================================

# Atalhos comuns
d: docker
u: up
s: status
l: logs
h: health
c: clean
fd: fly-deploy
fs: fly-status
fl: fly-logs
gp: git-deploy
gs: github-status
gt: fly-token 