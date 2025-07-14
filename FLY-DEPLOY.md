# 🚀 Deploy TV Dashboard no Fly.io

Guia completo para fazer deploy do TV Dashboard no Fly.io com configuração profissional e otimizada.

## 📋 Pré-requisitos

- [ ] Conta gratuita no [Fly.io](https://fly.io/app/sign-up)
- [ ] Projeto TV Dashboard funcionando localmente
- [ ] Docker instalado (para testes locais)

## 🎯 Configuração Fly.io

### 1. Setup Automático (Recomendado)

```bash
# Setup completo em um comando
make fly-setup
```

Este comando irá:
- ✅ Instalar Fly.io CLI
- ✅ Autenticar sua conta
- ✅ Criar app "tv-dashboard"
- ✅ Fazer deploy
- ✅ Abrir no browser

### 2. Setup Manual (Passo a passo)

```bash
# 1. Instalar Fly.io CLI
make fly-install

# 2. Login na sua conta
make fly-auth

# 3. Criar app
make fly-create

# 4. Deploy
make fly-deploy

# 5. Abrir no browser
make fly-open
```

## 📊 Monitoramento

### Status e Logs
```bash
# Status do app
make fly-status  # ou 'make fs'

# Ver logs em tempo real
make fly-logs    # ou 'make fl'

# Deploy atualização
make fly-deploy  # ou 'make fd'
```

### Health Check
```bash
# Verificar se está online
curl https://tv-dashboard.fly.dev/health
```

## ⚙️ Configuração Avançada

### Recursos Alocados
```toml
# fly.toml - já configurado
[vm]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256  # Free tier: perfeito para 7.6MB real
```

### Variáveis de Ambiente
```bash
# Ver variáveis atuais
flyctl config show

# Definir nova variável
flyctl secrets set APP_DEBUG=false
```

### Regiões Disponíveis
```bash
# Listar regiões
flyctl platform regions

# Mudar região (exemplo)
flyctl regions set fra lhr  # Frankfurt + London
```

## 🔧 Comandos Úteis

### Deploy e Manutenção
```bash
make fly-deploy    # Deploy nova versão
make fly-status    # Status do app
make fly-logs      # Ver logs
make fly-open      # Abrir no browser
make fly-ssh       # SSH no container
```

### Troubleshooting
```bash
# Ver configuração atual
flyctl config show

# Restart app
flyctl apps restart tv-dashboard

# Ver métricas
flyctl metrics

# Debug app
flyctl ssh console
```

## 📈 Otimizações Fly.io

### ✅ O que já está configurado:

1. **Performance:**
   - Nginx otimizado para TV streams
   - Gzip habilitado (6x compressão)
   - Cache assets (1 ano) vs HTML (no-cache)

2. **Segurança:**
   - HTTPS forçado
   - Headers de segurança
   - CORS configurado para streams

3. **Reliability:**
   - Health checks automáticos
   - Auto-restart se falhar
   - Mínimo 1 máquina sempre rodando

4. **Recursos:**
   - 7.6MB RAM real vs 256MB limite
   - CPU shared (suficiente para nginx)
   - Region: fra (Frankfurt - central Europa)

## 🌍 URLs e Endpoints

```
Produção: https://tv-dashboard.fly.dev/
Health:   https://tv-dashboard.fly.dev/health
Favicon:  https://tv-dashboard.fly.dev/favicon.ico
```

## 💰 Custos

**Free Tier Fly.io:**
- ✅ 3 máquinas pequenas grátis
- ✅ 160GB transferência/mês
- ✅ Seu app usa <8MB RAM (97% sobra!)
- ✅ **Custo: $0/mês** 🎉

## 🆘 Troubleshooting

### App não inicia
```bash
# Ver logs detalhados
make fly-logs

# SSH para debug
make fly-ssh
```

### Performance lenta
```bash
# Ver métricas
flyctl metrics

# Verificar região
flyctl regions list
```

### Erro de deploy
```bash
# Verificar Dockerfile
docker build -t test .

# Deploy com logs verbose
flyctl deploy --verbose
```

## 🔄 Workflow Recomendado

1. **Desenvolvimento local:**
   ```bash
   make dev  # Teste local
   ```

2. **Deploy para produção:**
   ```bash
   make fly-deploy
   ```

3. **Verificar deploy:**
   ```bash
   make fly-status
   curl https://tv-dashboard.fly.dev/health
   ```

4. **Monitorar:**
   ```bash
   make fly-logs
   ```

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Configurar domínio customizado:**
   ```bash
   flyctl certs create tv-dashboard.seudominio.com
   ```

2. **Configurar múltiplas regiões:**
   ```bash
   flyctl regions set fra lhr iad  # Europa + EUA
   ```

3. **Backup automático:**
   - Configurações salvas no localStorage
   - Export/import via interface

## 📞 Suporte

- **Fly.io Docs:** https://fly.io/docs/
- **Community:** https://community.fly.io/
- **Status:** https://status.fly.io/

---

🎉 **Seu TV Dashboard está pronto para o mundo!** 🌍 