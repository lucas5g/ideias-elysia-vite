# 🎙️ Chatwoot Audio Transcriber

Extensão Chrome que transcreve automaticamente mensagens de áudio no Chatwoot usando a API da Groq (Whisper).

## ✨ Funcionalidades

- 🔍 **Detecção Automática**: Identifica automaticamente mensagens de áudio no Chatwoot
- 🎯 **Transcrição Instantânea**: Transcreve áudios usando o modelo Whisper Large V3 da Groq
- 💬 **Integração Perfeita**: Exibe a transcrição diretamente na interface do Chatwoot
- 🔐 **Seguro**: Sua API key é armazenada localmente no navegador
- ⚡ **Rápido**: Sem necessidade de backend próprio
- 🌐 **Multi-plataforma**: Funciona com WhatsApp, Instagram e outros canais do Chatwoot

## 📋 Pré-requisitos

- Google Chrome ou navegador baseado em Chromium
- Conta no Groq (gratuita) - [console.groq.com](https://console.groq.com)
- Acesso a uma instância do Chatwoot

## 🚀 Instalação

### 1. Clone ou baixe este repositório

```bash
git clone <seu-repositorio>
cd transcribe-audio-vc
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Faça o build da extensão

```bash
npm run build
```

Isso irá gerar o arquivo `contentScript.js` na pasta `dist/`.

### 4. Copie os arquivos para a estrutura final

Após o build, certifique-se de que a estrutura de arquivos está assim:

```
transcribe-audio-vc/
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── contentScript.js (copiado de dist/)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

Copie o `contentScript.js` gerado:

```bash
cp dist/contentScript.js .
```

### 5. Carregue a extensão no Chrome

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta `transcribe-audio-vc`

### 6. Configure sua API Key do Groq

1. Obtenha sua API key em [console.groq.com/keys](https://console.groq.com/keys)
2. Clique no ícone da extensão na barra de ferramentas
3. Cole sua API key no campo
4. Clique em **Salvar API Key**

## 🎯 Como Usar

1. Navegue até sua instância do Chatwoot
2. Abra uma conversa que contenha mensagens de áudio
3. A extensão irá automaticamente:
   - Detectar os áudios
   - Transcrevê-los usando a API da Groq
   - Exibir a transcrição logo abaixo do player de áudio

## 🛠️ Desenvolvimento

### Modo de desenvolvimento (com auto-reload)

```bash
npm run dev
```

Isso irá observar mudanças no código e recompilar automaticamente.

### Estrutura do Projeto

```
.
├── src/
│   └── contentScript.js    # Script principal injetado no Chatwoot
├── manifest.json           # Configuração da extensão
├── popup.html             # Interface do popup
├── popup.js               # Lógica do popup
├── styles.css             # Estilos da transcrição
├── vite.config.js         # Configuração do Vite
└── package.json           # Dependências
```

### Scripts Disponíveis

- `npm run dev` - Build em modo desenvolvimento com watch
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## 🔧 Tecnologias Utilizadas

- **Manifest V3** - Última versão do sistema de extensões do Chrome
- **Groq SDK** - Cliente JavaScript para a API da Groq
- **Vite** - Build tool para bundling de ES modules
- **Whisper Large V3** - Modelo de transcrição de áudio

## 🌐 Domínios Suportados

A extensão funciona nos seguintes domínios:

- `*.chatwoot.com`
- `*.chatwoot.app`
- `*.chatwoot.cloud`
- `localhost:*` (para desenvolvimento)

## ⚙️ Configurações Avançadas

### Alterar o idioma da transcrição

Edite `src/contentScript.js` e modifique a linha:

```javascript
const transcription = await groq.audio.transcriptions.create({
  file: file,
  model: 'whisper-large-v3',
  language: 'pt', // Altere para 'en', 'es', etc. ou remova para auto-detecção
  response_format: 'json',
  temperature: 0.0
});
```

### Customizar aparência da transcrição

Edite `styles.css` para personalizar cores, fontes e layout.

## 🐛 Troubleshooting

### A extensão não detecta áudios

- Verifique se você está em uma página do Chatwoot
- Abra o Console do DevTools (F12) e procure por logs `[Chatwoot Transcriber]`
- Recarregue a página do Chatwoot

### Erro "API Key não configurada"

- Clique no ícone da extensão
- Configure sua API key do Groq
- Recarregue a página do Chatwoot

### Erro ao transcrever

- Verifique se sua API key está correta
- Confirme que você tem créditos na sua conta Groq
- Verifique se o formato do áudio é suportado (mp3, m4a, ogg, wav, webm)

### Console logs úteis

A extensão registra todo o processo no console:

```javascript
// Para ver logs detalhados
// Abra DevTools (F12) > Console
// Procure por mensagens começando com [Chatwoot Transcriber]
```

## 📝 Limitações

- A API gratuita do Groq tem limites de requisições
- Áudios muito longos podem levar mais tempo para transcrever
- A extensão precisa de conexão com internet para funcionar

## 🔒 Privacidade

- Sua API key é armazenada apenas localmente no navegador
- Os áudios são enviados diretamente para a API da Groq
- Nenhum dado é enviado para servidores de terceiros além do Groq

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Suporte

Se encontrar problemas ou tiver sugestões, abra uma issue neste repositório.

---

**Feito com ❤️ usando Groq Whisper**
