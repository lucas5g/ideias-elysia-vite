# 🎙️ Chatwoot Audio Transcriber

## 📦 Arquivos da Extensão

```
transcribe-audio-vc/
│
├── 📄 manifest.json                 ← Configuração da extensão Chrome
├── 🎨 popup.html                    ← Interface do popup (configurar API key)
├── ⚙️  popup.js                      ← Lógica do popup
├── 🎨 styles.css                    ← Estilos da transcrição
├── 📝 contentScript.js              ← Script compilado (injeta no Chatwoot)
│
├── 📁 src/
│   └── contentScript.js             ← Código fonte (ES modules)
│
├── 📁 icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── 📦 package.json                  ← Dependências (groq-sdk, vite)
├── ⚙️  vite.config.js                ← Configuração de build
├── 🚀 build.sh                      ← Script de build automatizado
│
├── 📖 README.md                     ← Documentação completa
├── ⚡ QUICKSTART.md                 ← Instalação rápida (3 min)
├── ✅ TESTING.md                    ← Checklist de testes
├── 🔧 CUSTOMIZATION.md              ← Guia de personalização
└── 📚 GROQ-API.md                   ← Info sobre a API Groq
```

## 🔄 Fluxo de Funcionamento

```
┌─────────────────────────────────────────────────────────────┐
│  1. USUÁRIO CONFIGURA                                       │
│     └─> Abre popup                                          │
│     └─> Insere API key do Groq                              │
│     └─> Clica em "Salvar"                                   │
│     └─> Key salva no chrome.storage                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. USUÁRIO ACESSA CHATWOOT                                 │
│     └─> Navega para *.chatwoot.com                          │
│     └─> Content script é injetado automaticamente           │
│     └─> MutationObserver inicia                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. DETECÇÃO DE ÁUDIO                                       │
│     └─> Observer detecta elemento <audio>                   │
│     └─> Valida se já foi transcrito                         │
│     └─> Extrai URL do áudio (src)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. DOWNLOAD DO ÁUDIO                                       │
│     └─> fetch(audioUrl)                                     │
│     └─> Converte para Blob                                  │
│     └─> Cria File object                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. TRANSCRIÇÃO                                             │
│     └─> Carrega API key do storage                          │
│     └─> Cria instância Groq SDK                             │
│     └─> Envia áudio para API                                │
│     └─> Model: whisper-large-v3                             │
│     └─> Aguarda resposta (2-5 seg)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. EXIBIÇÃO                                                │
│     └─> Recebe texto da transcrição                         │
│     └─> Cria elemento HTML estilizado                       │
│     └─> Injeta abaixo do player de áudio                    │
│     └─> Marca áudio como "transcrito"                       │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Como Funciona Tecnicamente

### Frontend (Popup)

```javascript
// popup.js
1. Carrega API key do chrome.storage.sync
2. Exibe no input
3. Ao salvar: valida formato (gsk_*)
4. Testa API key com fetch
5. Salva no storage
6. Notifica content scripts
```

### Backend (Content Script)

```javascript
// src/contentScript.js
1. MutationObserver monitora DOM
2. Detecta novos <audio> elements
3. Para cada áudio:
   a. Valida se não foi processado
   b. Mostra "Carregando..."
   c. Baixa blob do áudio
   d. Envia para Groq API
   e. Recebe transcrição
   f. Renderiza abaixo do player
```

## 📊 Estrutura de Dados

### Chrome Storage

```javascript
{
  "groq_api_key": "gsk_xxxxxxxxxxxxx"  // API key do Groq
}
```

### Audio Element

```html
<audio 
  src="https://chatwoot.com/audio/12345.ogg" 
  controls
  data-transcribed="true"  ← Flag de processamento
>
</audio>

<div class="groq-transcript success">
  <strong>📝 Transcrição</strong>
  <div class="groq-transcript-text">
    Olá, como vai? Preciso de ajuda com...
  </div>
</div>
```

## 🔌 Integrações

```
Chrome Extension
       ↓
   Chatwoot DOM
       ↓
  Audio Element
       ↓
   Groq API (Whisper)
       ↓
   Transcrição
       ↓
  UI do Chatwoot
```

## 🎯 Comandos Principais

```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Build + watch (desenvolvimento)
npm run dev

# Copiar para raiz
cp dist/contentScript.js .

# Build completo (script automatizado)
./build.sh
```

## 📋 Checklist de Instalação

1. ✅ `npm install` → Instala dependências
2. ✅ `npm run build` → Compila TypeScript/ES6
3. ✅ `cp dist/contentScript.js .` → Copia arquivo
4. ✅ Carregar em `chrome://extensions/`
5. ✅ Configurar API key no popup
6. ✅ Testar no Chatwoot

## 🎨 Personalização Rápida

### Mudar Cor da Transcrição

```css
/* styles.css */
.groq-transcript {
  background: #SUA_COR;
  border-left-color: #SUA_COR;
}
```

### Mudar Idioma

```javascript
// src/contentScript.js
language: 'en'  // ou 'es', 'fr', etc.
```

### Adicionar Domínio

```json
// manifest.json
"matches": [
  "https://meudominio.com/*"
]
```

## 🐛 Debug

### Console Logs

```
[Chatwoot Transcriber] Content script carregado
[Chatwoot Transcriber] API Key carregada
[Chatwoot Transcriber] Iniciando transcrição
[Chatwoot Transcriber] Transcrição recebida
```

### Verificar Storage

```javascript
// No console do DevTools
chrome.storage.sync.get(['groq_api_key'], console.log)
```

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| README.md | Documentação completa |
| QUICKSTART.md | Instalação rápida |
| TESTING.md | Checklist de testes |
| CUSTOMIZATION.md | Como customizar |
| GROQ-API.md | Info sobre API |

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
# Recarrega em chrome://extensions/
```

### Produção
```bash
npm run build
cp dist/contentScript.js .
# Criar ZIP para Chrome Web Store
```

---

**Versão:** 1.0.0  
**Licença:** MIT  
**Stack:** Chrome Extension (Manifest V3) + Groq API + Vite  
**Compatibilidade:** Chrome 88+, Edge 88+

**Criado com ❤️ usando Groq Whisper Large V3**
