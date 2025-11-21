#!/bin/bash
# Script para empacotar a extensão Chrome

echo "📦 Empacotando extensão..."

# Cria diretório de build se não existir
mkdir -p build

# Remove build anterior
rm -f build/chatwoot-transcriber.zip

# Lista de arquivos a incluir
FILES=(
  "manifest.json"
  "background.js"
  "contentScript.js"
  "popup.html"
  "popup.js"
  "styles.css"
  "icons/"
)

# Cria arquivo zip
cd /home/lucas/projects/ideias-elysia-vite/extensions/transcribe-audio-vc
zip -r build/chatwoot-transcriber.zip "${FILES[@]}" -x "*.DS_Store" "*.git*"

echo "✅ Extensão empacotada em: build/chatwoot-transcriber.zip"
echo ""
echo "📤 Para instalar:"
echo "1. Envie o arquivo .zip para seus colegas"
echo "2. Peça para extraírem a pasta"
echo "3. Em chrome://extensions, ativar 'Modo desenvolvedor'"
echo "4. Clicar em 'Carregar sem compactação' e selecionar a pasta extraída"
