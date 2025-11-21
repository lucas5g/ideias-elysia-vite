# 🚀 Quick Start - Chatwoot Audio Transcriber

## Instalação Rápida (3 minutos)

### 1️⃣ Instalar dependências e fazer build
```bash
chmod +x build.sh
./build.sh
```

Ou manualmente:
```bash
npm install
npm run build
cp dist/contentScript.js .
```

### 2️⃣ Adicionar ícones (opcional, mas recomendado)

Crie imagens PNG nos seguintes tamanhos:
- `icons/icon16.png` - 16x16px
- `icons/icon48.png` - 48x48px  
- `icons/icon128.png` - 128x128px

**Dica**: Use um ícone de microfone ou áudio. Se não tiver, a extensão funcionará mesmo sem os ícones (com ícone padrão do Chrome).

### 3️⃣ Carregar no Chrome

1. Abra: `chrome://extensions/`
2. Ative: **Modo do desenvolvedor** (canto superior direito)
3. Clique: **Carregar sem compactação**
4. Selecione: Esta pasta (`transcribe-audio-vc`)

### 4️⃣ Configurar API Key do Groq

1. Obtenha gratuitamente em: https://console.groq.com/keys
2. Clique no ícone da extensão (🧩)
3. Cole sua API key
4. Clique em **Salvar**

### 5️⃣ Testar!

1. Acesse seu Chatwoot
2. Abra uma conversa com áudios
3. Veja a transcrição aparecer automaticamente! ✨

---

## 📝 Comandos Úteis

```bash
# Build único
npm run build

# Build com watch (desenvolvimento)
npm run dev

# Rebuild completo
rm -rf node_modules dist contentScript.js
npm install
npm run build
cp dist/contentScript.js .
```

---

## 🐛 Problemas Comuns

### "Erro ao carregar extensão"
- Verifique se rodou `npm run build`
- Confirme que `contentScript.js` existe na raiz

### "API Key não configurada"
- Clique no ícone da extensão
- Configure a API key do Groq

### "Áudios não são transcritos"
- Abra DevTools (F12) > Console
- Procure por erros com `[Chatwoot Transcriber]`
- Recarregue a página do Chatwoot

---

## 📦 Estrutura de Arquivos

```
transcribe-audio-vc/
├── 📄 manifest.json          # Configuração da extensão
├── 🎨 popup.html            # Interface do popup
├── ⚙️  popup.js              # Lógica do popup
├── 🎨 styles.css            # Estilos da transcrição
├── 📝 contentScript.js      # Script compilado (gerado)
├── 📁 src/
│   └── contentScript.js     # Código fonte
├── 📁 icons/                # Ícones da extensão
├── 📦 package.json          # Dependências
├── ⚙️  vite.config.js        # Config do bundler
└── 🚀 build.sh              # Script de build
```

---

## 🎯 Como Funciona

1. **MutationObserver** monitora o DOM do Chatwoot
2. Quando um `<audio>` é detectado:
   - Baixa o arquivo de áudio
   - Envia para Groq API (Whisper Large V3)
   - Recebe a transcrição
   - Injeta o texto abaixo do player

---

## 💡 Dicas

- A API gratuita do Groq é generosa, mas tem limites
- Transcrições são rápidas (1-3 segundos por áudio)
- Funciona com WhatsApp, Instagram, etc.
- Suporta múltiplos idiomas (configurável)

---

**Precisa de ajuda?** Abra uma issue ou leia o README.md completo.
