# 📺 TV Dashboard - Professional Edition

Professional system for monitoring multiple TV channels with advanced server configurations and automatic deployment via GitHub Actions.

[![Deploy to Fly.io](https://github.com/mikusher/tv-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/mikusher/tv-dashboard/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://tv-dashboard.fly.dev/)

## 🌐 Automatic Deployment

The project has continuous integration with GitHub Actions that automatically deploys to Fly.io with every commit to the main branch.

**🔗 Direct Access:** https://tv-dashboard.fly.dev/

## 🚀 Super Simple Execution with Makefile

### ⚡ **Main Commands**
```bash
# See all available commands
make help

# Local development
make dev              # Local server port 8080
make dev PORT=3000    # Local server custom port

# Docker (Production)
make docker           # Build + run + health check
make up               # Start containers
make down             # Stop containers

# Monitoring
make status           # Container status
make health           # Health check
make test             # Complete application test
make logs             # Real-time logs
```

### 🔧 **Quick Setup**
```bash
# First time
git clone <repo>
cd tv-dashboard
make docker          # Complete automatic setup!
```

## 📋 **All Makefile Commands**

### 🔧 **Local Development**
```bash
make install          # Copy .env
make dev              # Local server
make build            # Build to dist/
make start            # Alias for make dev
```

### 🐳 **Docker**
```bash
make docker           # Complete build + run
make up               # Start containers
make down             # Stop containers  
make restart          # Restart containers
make build-docker     # Build image only
make run-docker       # Run container only
```

### 📊 **Monitoring**
```bash
make status           # Container status
make health           # Health check
make test             # Test application
make logs             # Real-time logs
```

### 🧹 **Cleanup**
```bash
make clean            # Basic cleanup
make clean-all        # Complete cleanup (networks, volumes)
```

### 🚁 **Fly.io**
```bash
make fly-setup        # Complete Fly.io setup (install + auth + create + deploy)
make fly-deploy       # Deploy to Fly.io
make fly-status       # Application status
make fly-logs         # Fly.io logs
```

### 🐙 **GitHub CI/CD**
```bash
make github-setup     # Configure GitHub repository
make github-push      # First commit and push
make git-deploy       # Commit + push (trigger deploy)
make fly-token        # Get token for GitHub Secrets
make github-status    # View GitHub Actions status
```

### 📖 **Examples**
```bash
make dev PORT=3000    # Local server on port 3000
make docker           # Complete deploy
```

## ⚙️ **Configuration**

### 🔧 **Environment Variables**
Copy and customize the `.env` file:
```bash
cp env.example .env
```

### 📝 **Main Settings**
```bash
# Server
PORT=8080                   # Server port
HOST=0.0.0.0               # Server host

# Docker
DOCKER_PORT=8080           # Docker port
DOCKER_HOST=0.0.0.0        # Docker host

# Application
APP_NAME=TV Dashboard      # Application name
APP_VERSION=1.0.0          # Version
APP_ENV=production         # Environment

# Default Settings
DEFAULT_GRID_LAYOUT=4x4     # 2x2|3x3|4x4
DEFAULT_THEME=dark          # dark|light
DEFAULT_AUTOPLAY=muted      # muted|off
DEFAULT_VOLUME=1.0          # 0.0-1.0
DEFAULT_LANGUAGE=en         # en|pt
```

## 📁 Structure
```
tv-dashboard/
├── index.html              # Main interface
├── favicon.ico             # Site icon
├── css/styles.css          # Styles
├── js/                     # JavaScript scripts
│   ├── script.js           # Main logic
│   ├── channels.js         # Channel management
│   ├── storage.js          # Local storage
│   └── config.js           # Configurations
├── env.example             # Complete configurations
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Professional nginx container
├── Makefile                # Automated commands
└── dist/                   # Build (generated)
```

## 🎯 Features

### 📺 **Core TV Features**
- ✅ **Multiple streams** simultaneous (up to 16)
- ✅ **Pre-configured channels** (PT, UK)
- ✅ **Complete management** of custom channels
- ✅ **Individual audio control**
- ✅ **Flexible layouts** (2x2, 3x3, 4x4)

### 🔧 **Professional Features**
- ✅ **Complete security headers**
- ✅ **Configurable CORS** for external streams
- ✅ **Optimized cache** for performance
- ✅ **Structured and rotating logs**
- ✅ **Automatic health checks**
- ✅ **Automatic gzip compression**
- ✅ **Traefik support** for reverse proxy

### 🛡️ **Security**
- ✅ **XSS protection headers**
- ✅ **Content-Type sniffing protection**
- ✅ **Configurable frame options**
- ✅ **Hidden server tokens**
- ✅ **Detailed access logs**

## 🚀 Production Deployment

### 🐳 **Docker with Traefik**
```bash
# Configure in .env
TRAEFIK_ENABLE=true
TRAEFIK_DOMAIN=tv.example.com

# Deploy
make docker
```

### ☁️ **Cloud Deployment**
The project is configured for automatic deployment on cloud platforms.

### 🖥️ **Traditional Server**
```bash
# 1. Copy files
scp -r . user@server:/var/www/tv-dashboard/

# 2. Deploy
make docker
```

## 📊 Monitoring

### 🔍 **Health Check**
```bash
make health
# or
curl http://localhost:8080/health
```

### 📈 **Debug**
```bash
make status         # View status
make logs           # View logs
make health         # Test health
```

### 🧹 **Cleanup**
```bash
make clean          # Basic cleanup
make clean-all      # Complete cleanup
```

## 🌐 Online Demo

- **🔗 Site**: https://tv-dashboard.fly.dev/
- **📱 Responsive**: Works on desktop, tablet and mobile
- **🔄 Updates**: Site updated automatically

## 📝 Technical Features

- **🎬 Optimized for TV**: Specific configurations for streaming
- **⚡ Performance**: Cache and compression optimizations
- **🔒 Security**: Security headers implemented
- **📦 Containerized**: Complete Docker support
- **🔧 Configurable**: Multiple customization options
- **🌐 Proxy-ready**: Native support for Traefik and nginx-proxy
- **⚡ Makefile**: Complete automation for development and deployment
- **🔄 CI/CD**: GitHub Actions integration
- **🌍 Global**: Worldwide accessibility
- **📊 Monitoring**: Health checks and structured logs 