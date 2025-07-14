#!/bin/bash

# TV Dashboard - Build Simples
echo "🚀 TV Dashboard - Build"

# Criar diretório dist
mkdir -p dist

# Copiar arquivos
cp -r css js *.html *.ico dist/ 2>/dev/null

echo "✅ Build concluído em ./dist/"
echo "💡 Para executar: cd dist && python3 -m http.server 8080" 