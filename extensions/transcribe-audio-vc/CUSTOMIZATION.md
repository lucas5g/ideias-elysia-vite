# 🔧 Guia de Customização

Este guia mostra como customizar e estender a extensão.

## 🌍 Alterar Idioma de Transcrição

Edite `src/contentScript.js`, linha ~73:

```javascript
const transcription = await groq.audio.transcriptions.create({
  file: file,
  model: 'whisper-large-v3',
  language: 'pt', // ← Altere aqui
  response_format: 'json',
  temperature: 0.0
});
```

**Opções:**
- `'pt'` - Português
- `'en'` - Inglês
- `'es'` - Espanhol
- `'fr'` - Francês
- `'de'` - Alemão
- `null` - Auto-detecção (remova a linha)

## 🎨 Customizar Aparência da Transcrição

Edite `styles.css`:

```css
.groq-transcript {
  /* Mude as cores */
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 3px solid #0ea5e9;
  
  /* Mude o tamanho da fonte */
  font-size: 14px;
  
  /* Adicione sombra */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

### Temas Prontos

**Tema Escuro:**
```css
.groq-transcript {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-left-color: #3b82f6;
  color: #e2e8f0;
}
```

**Tema Minimalista:**
```css
.groq-transcript {
  background: #f9fafb;
  border-left: 2px solid #d1d5db;
  color: #374151;
  font-size: 13px;
  padding: 8px 12px;
}
```

## ⚡ Adicionar Botão de Copiar

Edite `src/contentScript.js`, função `createTranscriptElement`:

```javascript
function createTranscriptElement(text, type = 'success') {
  const div = document.createElement('div');
  div.className = `groq-transcript ${type}`;

  if (type === 'success') {
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>📝 Transcrição</strong>
        <button onclick="navigator.clipboard.writeText('${text.replace(/'/g, "\\'")}'); alert('Copiado!')" 
                style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
          Copiar
        </button>
      </div>
      <div class="groq-transcript-text">${text}</div>
    `;
  }
  // ... resto do código
}
```

## 🔊 Adicionar Suporte a Mais Formatos

A extensão já suporta os principais formatos, mas você pode adicionar mais:

Edite `src/contentScript.js`, função `getFileExtension`:

```javascript
const mimeMap = {
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',        // ← Adicione novos formatos
  'audio/flac': 'flac',      // ← aqui
  'audio/x-wav': 'wav'
};
```

## 📊 Adicionar Estatísticas

Adicione um contador de transcrições:

**1. No `src/contentScript.js`, adicione no topo:**

```javascript
let transcriptionStats = {
  total: 0,
  successful: 0,
  failed: 0
};

// Carrega stats salvos
chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) {
    transcriptionStats = result.stats;
  }
});
```

**2. Atualize as stats após cada transcrição:**

```javascript
// No bloco try (sucesso)
transcriptionStats.total++;
transcriptionStats.successful++;
chrome.storage.local.set({ stats: transcriptionStats });

// No bloco catch (erro)
transcriptionStats.total++;
transcriptionStats.failed++;
chrome.storage.local.set({ stats: transcriptionStats });
```

**3. Exiba no popup - adicione em `popup.html`:**

```html
<div class="stats" style="margin-top: 12px; font-size: 12px; color: #6b7280;">
  <strong>Estatísticas:</strong>
  <div id="statsDisplay">Carregando...</div>
</div>
```

**4. Em `popup.js`, carregue as stats:**

```javascript
chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) {
    const { total, successful, failed } = result.stats;
    document.getElementById('statsDisplay').innerHTML = `
      Total: ${total} | Sucesso: ${successful} | Falhas: ${failed}
    `;
  }
});
```

## 🌐 Adicionar Mais Domínios

Edite `manifest.json`, seção `content_scripts`:

```json
"matches": [
  "https://*.chatwoot.com/*",
  "https://*.chatwoot.app/*",
  "https://*.chatwoot.cloud/*",
  "http://localhost:*/*",
  "https://meudominio.com.br/*"  // ← Adicione aqui
]
```

## 🎯 Adicionar Detecção de Sentimento

Faça uma segunda chamada à API após a transcrição:

```javascript
// Após receber a transcrição
const sentiment = await analyzeSentiment(transcriptText);

// Nova função
async function analyzeSentiment(text) {
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Analise o sentimento deste texto em uma palavra (positivo/neutro/negativo): "${text}"`
    }],
    temperature: 0.0,
    max_tokens: 10
  });
  
  return response.choices[0].message.content.trim().toLowerCase();
}

// Adicione ícone de sentimento na transcrição
const sentimentEmoji = {
  'positivo': '😊',
  'neutro': '😐',
  'negativo': '😟'
}[sentiment] || '📝';
```

## 🔄 Adicionar Botão de Re-transcrever

Para permitir tentar novamente em caso de erro:

```javascript
function createTranscriptElement(text, type = 'success', audioElement = null) {
  const div = document.createElement('div');
  div.className = `groq-transcript ${type}`;

  if (type === 'error' && audioElement) {
    div.innerHTML = `
      <strong>⚠️ Erro na Transcrição</strong>
      <div class="groq-transcript-text">${text}</div>
      <button onclick="this.parentElement.remove(); this.audioElement.dataset.transcribed = ''; transcribeAudio(this.audioElement)" 
              style="margin-top: 8px; padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Tentar Novamente
      </button>
    `;
    div.querySelector('button').audioElement = audioElement;
  }
  // ... resto do código
}
```

## 🚀 Rebuild Após Mudanças

Sempre que modificar `src/contentScript.js`, rode:

```bash
npm run build
cp dist/contentScript.js .
```

Depois recarregue a extensão em `chrome://extensions/`

## 📦 Criar Pacote para Distribuição

Para distribuir a extensão:

```bash
# Remova arquivos desnecessários
zip -r chatwoot-transcriber.zip . \
  -x "node_modules/*" \
  -x "src/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x "*.sh"
```

Você pode publicar na Chrome Web Store ou distribuir o arquivo .zip.

---

**Dica:** Teste sempre em ambiente de desenvolvimento antes de usar em produção!
