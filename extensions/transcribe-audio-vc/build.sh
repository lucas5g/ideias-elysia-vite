# Chatwoot Audio Transcriber - Build Script

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎙️  Chatwoot Audio Transcriber - Build${NC}"
echo ""

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências${NC}"
        exit 1
    fi
fi

# Build com Vite
echo -e "${BLUE}🔨 Compilando content script...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi

# Copia o arquivo compilado para a raiz
echo -e "${BLUE}📋 Copiando arquivo compilado...${NC}"
cp dist/contentScript.js .

# Verifica se os ícones existem, se não, cria placeholders
if [ ! -d "icons" ]; then
    echo -e "${BLUE}🎨 Criando pasta de ícones...${NC}"
    mkdir -p icons
    echo "Os ícones precisam ser adicionados manualmente em icons/" > icons/README.txt
fi

echo ""
echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📁 Estrutura da extensão:${NC}"
echo "   ├── manifest.json"
echo "   ├── popup.html"
echo "   ├── popup.js"
echo "   ├── styles.css"
echo "   ├── contentScript.js"
echo "   └── icons/"
echo ""
echo -e "${BLUE}🚀 Próximos passos:${NC}"
echo "   1. Adicione ícones em icons/ (16x16, 48x48, 128x128)"
echo "   2. Abra chrome://extensions/"
echo "   3. Ative 'Modo do desenvolvedor'"
echo "   4. Clique em 'Carregar sem compactação'"
echo "   5. Selecione esta pasta"
echo ""
echo -e "${GREEN}🎉 Pronto para usar!${NC}"
