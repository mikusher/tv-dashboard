FROM nginx:alpine

# Instalar gettext para envsubst (expansão de variáveis)
RUN apk add --no-cache gettext

# Copiar arquivos da aplicação
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY *.html /usr/share/nginx/html/
COPY *.ico /usr/share/nginx/html/

# Criar template de configuração nginx
COPY <<EOF /etc/nginx/templates/default.conf.template
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Server tokens
    server_tokens off;
    
    # Timeout settings
    keepalive_timeout 65;
    client_header_timeout 60;
    client_body_timeout 60;
    
    # Client settings
    client_max_body_size 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CORS headers para streams
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Range" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Health check - SIMPLES
    location = /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Main location
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}

# Log format customizado
log_format tv_dashboard '\$remote_addr - \$remote_user [\$time_local] '
                       '"\$request" \$status \$bytes_sent '
                       '"\$http_referer" "\$http_user_agent" '
                       '"\$http_x_forwarded_for" rt=\$request_time ';
EOF

# Script de inicialização customizado
COPY <<EOF /docker-entrypoint.d/30-tv-dashboard-config.sh
#!/bin/sh

# Log de inicialização
echo "\$(date): TV Dashboard configurado com:"
echo "  - APP_NAME: \${APP_NAME:-TV Dashboard}"
echo "  - APP_VERSION: \${APP_VERSION:-1.0.0}"
echo "  - APP_ENV: \${APP_ENV:-production}"
echo "  - NGINX_WORKER_CONNECTIONS: \${NGINX_WORKER_CONNECTIONS:-1024}"
echo "  - NGINX_KEEPALIVE_TIMEOUT: \${NGINX_KEEPALIVE_TIMEOUT:-65}"
echo "  - CORS_ENABLED: \${CORS_ENABLED:-true}"
echo "  - LOG_LEVEL: \${LOG_LEVEL:-info}"

# Definir variáveis padrão se não estiverem definidas
export SERVER_TOKENS=\${SERVER_TOKENS:-off}
export NGINX_KEEPALIVE_TIMEOUT=\${NGINX_KEEPALIVE_TIMEOUT:-65}
export NGINX_CLIENT_TIMEOUT=\${NGINX_CLIENT_TIMEOUT:-60}
export NGINX_CLIENT_MAX_BODY_SIZE=\${NGINX_CLIENT_MAX_BODY_SIZE:-100M}
export X_FRAME_OPTIONS=\${X_FRAME_OPTIONS:-DENY}
export X_CONTENT_TYPE_OPTIONS=\${X_CONTENT_TYPE_OPTIONS:-nosniff}
export X_XSS_PROTECTION=\${X_XSS_PROTECTION:-1; mode=block}
export CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS:-*}
export CORS_ALLOWED_METHODS=\${CORS_ALLOWED_METHODS:-GET,HEAD,OPTIONS}
export CORS_ALLOWED_HEADERS=\${CORS_ALLOWED_HEADERS:-Origin,X-Requested-With,Content-Type,Accept}
export NGINX_GZIP_ENABLED=\${NGINX_GZIP_ENABLED:-on}
export HTML_CACHE_CONTROL=\${HTML_CACHE_CONTROL:-no-cache, no-store, must-revalidate}
export STATIC_ASSETS_CACHE=\${STATIC_ASSETS_CACHE:-1y}
EOF

# Tornar o script executável
RUN chmod +x /docker-entrypoint.d/30-tv-dashboard-config.sh

# Criar diretório de logs
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

EXPOSE 8080

# Labels para metadados
LABEL maintainer="TV Dashboard Team"
LABEL version="1.0.0"
LABEL description="Professional TV streaming dashboard with advanced nginx configuration" 