// src/contentScript.js - Script injetado no Chatwoot para detectar e transcrever áudios

import Groq from 'groq-sdk';

console.log('[Chatwoot Transcriber] Content script carregado');

let groqApiKey = null;
let processingAudios = new Set(); // Evita processar o mesmo áudio múltiplas vezes

// DEBUG: nível de verbosidade (0 = off, 1 = minimo, 2 = detalhado)
const DEBUG_LEVEL = 1;

function logDebug(...args) {
  if (DEBUG_LEVEL >= 2) console.debug('[Chatwoot Transcriber][DEBUG]', ...args);
}

function logInfo(...args) {
  if (DEBUG_LEVEL >= 1) console.log('[Chatwoot Transcriber]', ...args);
}

// Carrega a API key do storage
async function loadApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['groq_api_key'], (result) => {
      groqApiKey = result.groq_api_key || null;
      if (groqApiKey) {
        logInfo('API Key carregada');
      } else {
        console.warn('[Chatwoot Transcriber] API Key não encontrada. Configure no popup da extensão.');
      }
      resolve(groqApiKey);
    });
  });
}

// Inicializa
loadApiKey();

// Escuta mensagens do popup (quando API key é atualizada)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'API_KEY_UPDATED') {
    logInfo('API Key atualizada');
    loadApiKey();
  }
});

// Função principal: transcreve um áudio
async function transcribeAudio(audioElement) {
  const audioSrc = audioElement.src;

  if (audioElement.dataset.transcribed === 'true') {
    logDebug('Áudio já transcrito, pulando:', audioSrc);
    return;
  }

  if (processingAudios.has(audioSrc)) {
    logDebug('Áudio já em processamento, pulando:', audioSrc);
    return;
  }

  // Marca como processando
  processingAudios.add(audioSrc);
  audioElement.dataset.transcribed = 'processing';

  logInfo('Iniciando transcrição:', audioSrc);

  logDebug('audioElement dataset before:', { dataset: { ...audioElement.dataset } });

  // Cria elemento de loading
  const loadingDiv = createTranscriptElement('Transcrevendo áudio...', 'loading');
  insertTranscriptElement(audioElement, loadingDiv);

  try {
    // Verifica se tem API key
    if (!groqApiKey) {
      await loadApiKey();
      if (!groqApiKey) {
        throw new Error('API Key não configurada. Abra o popup da extensão e configure sua Groq API Key.');
      }
    }

    // Baixa o áudio
    logInfo('Baixando áudio...');
    logDebug('Fetch audio URL:', audioSrc);
    const audioBlob = await fetchAudioBlob(audioSrc);

    // Determina o tipo de arquivo
    const fileExtension = getFileExtension(audioSrc, audioBlob.type);

    // Garante que o MIME type está correto
    let mimeType = audioBlob.type;
    if (fileExtension === 'ogg' && (!mimeType || !mimeType.includes('ogg'))) {
      mimeType = 'audio/ogg';
    }

    const fileName = `audio.${fileExtension}`;

    logInfo('Áudio baixado:', audioBlob.size, 'bytes, tipo:', mimeType);
    logDebug('AudioBlob details:', audioBlob);

    // Cria instância do Groq
    logDebug('Inicializando Groq SDK...');
    const groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true // Necessário para usar no browser
    });

    // Envia para transcrição
    logInfo('Enviando para Groq...');
    const file = new File([audioBlob], fileName, { type: mimeType });
    logDebug('File prepared for upload:', { name: file.name, type: file.type, size: file.size });

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
      language: 'pt', // Português (pode ser removido para auto-detecção)
      response_format: 'json',
      temperature: 0.0
    });

    logDebug('Raw transcription response:', transcription);
    const transcriptText = transcription && (transcription.text || transcription.transcript || transcription.result || (transcription.data && transcription.data.text)) || '';
    logInfo('Transcrição recebida (trecho):', transcriptText ? transcriptText.slice(0, 120) + (transcriptText.length > 120 ? '...' : '') : '<vazio>');

    // Remove loading e adiciona transcrição
    loadingDiv.remove();
    const transcriptDiv = createTranscriptElement(transcriptText, 'success');
    insertTranscriptElement(audioElement, transcriptDiv);

    // Marca como concluído
    audioElement.dataset.transcribed = 'true';

  } catch (error) {
    console.error('[Chatwoot Transcriber] Erro ao transcrever:', error, error && error.stack);

    // Remove loading e mostra erro
    loadingDiv.remove();
    const errorDiv = createTranscriptElement(
      `Erro ao transcrever: ${error.message}`,
      'error'
    );
    insertTranscriptElement(audioElement, errorDiv);

    // Marca como erro (permite tentar novamente)
    audioElement.dataset.transcribed = 'error';
  } finally {
    processingAudios.delete(audioSrc);
    logDebug('processingAudios set after delete:', Array.from(processingAudios));
  }
}

// Baixa o áudio como blob usando background script para evitar CORS
async function fetchAudioBlob(url) {
  try {
    console.log('[Chatwoot Transcriber] Enviando mensagem para background script:', url);

    // Envia mensagem para o background script fazer o download
    const response = await chrome.runtime.sendMessage({
      type: 'FETCH_AUDIO',
      url: url
    });

    console.log('[Chatwoot Transcriber] Resposta do background script:', response);

    if (!response || !response.success) {
      throw new Error(response?.error || 'Falha ao baixar áudio via background script');
    }

    // Converte base64 de volta para blob
    const base64 = response.data;
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    console.log('[Chatwoot Transcriber] Blob criado:', blob.size, 'bytes, tipo:', blob.type);
    return blob;
  } catch (err) {
    console.error('[Chatwoot Transcriber] fetchAudioBlob error:', err);
    throw err;
  }
}

// Determina a extensão do arquivo
function getFileExtension(url, mimeType) {
  // Tenta pela URL primeiro
  const urlMatch = url.match(/\.([a-z0-9]+)(\?|$)/i);
  if (urlMatch) {
    let ext = urlMatch[1].toLowerCase();
    // Converte .oga para .ogg (formato aceito pelo Groq)
    if (ext === 'oga') ext = 'ogg';
    // Garante que está na lista de formatos aceitos
    const acceptedFormats = ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'opus', 'wav', 'webm'];
    if (acceptedFormats.includes(ext)) {
      return ext;
    }
  }

  // Tenta pelo MIME type
  const mimeMap = {
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/x-m4a': 'm4a',
    'audio/opus': 'opus',
    'audio/flac': 'flac'
  };

  return mimeMap[mimeType] || 'ogg'; // Default para ogg
}

// Cria elemento HTML da transcrição
function createTranscriptElement(text, type = 'success') {
  const div = document.createElement('div');
  div.className = `groq-transcript ${type}`;

  if (type === 'loading') {
    div.innerHTML = `
      <strong>
        <span class="groq-loading-spinner"></span>
        Transcrição
      </strong>
      <div class="groq-transcript-text">${text}</div>
    `;
  } else if (type === 'error') {
    div.innerHTML = `
      <strong>
        <span class="groq-error-icon">⚠️</span>
        Erro na Transcrição
      </strong>
      <div class="groq-transcript-text">${text}</div>
    `;
  } else {
    div.innerHTML = `
      <div class="groq-transcript-text">${text}</div>
    `;
  }

  return div;
}

// Insere o elemento de transcrição no DOM
function insertTranscriptElement(audioElement, transcriptElement) {
  // Remove transcrições anteriores (caso existam)
  const existingTranscript = audioElement.parentElement.querySelector('.groq-transcript');
  if (existingTranscript) {
    existingTranscript.remove();
  }

  // Insere após o elemento de áudio
  // No Chatwoot, o áudio geralmente está dentro de um container
  const insertionPoint = audioElement.closest('.message-text--metadata') ||
    audioElement.closest('.attachment') ||
    audioElement.parentElement;

  if (insertionPoint) {
    insertionPoint.appendChild(transcriptElement);
  } else {
    audioElement.parentNode.insertBefore(transcriptElement, audioElement.nextSibling);
  }
}

// Processa um elemento de áudio
function processAudioElement(audioElement) {
  // Em vez de transcrever automaticamente, apenas tenta anexar o botão ao container
  try {
    const parent = audioElement.parentElement || audioElement;
    attachTranscribeButtonsIn(parent);
  } catch (err) {
    logDebug('processAudioElement attach failed:', err);
  }
}

// Observer para detectar novos áudios
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    logDebug('Mutation observed:', mutation.type, mutation.addedNodes ? mutation.addedNodes.length : 0);
    mutation.addedNodes.forEach((node) => {
      // Verifica se é um elemento
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      logDebug('Node added:', node.tagName || node.nodeName, node);

      // Verifica se é um áudio
      if (node.tagName === 'AUDIO') {
        logDebug('Novo elemento <audio> detectado diretamente');
        processAudioElement(node);
      }

      // Procura áudios dentro do nó adicionado
      const audioElements = node.querySelectorAll ? node.querySelectorAll('audio') : [];
      if (audioElements && audioElements.length) logDebug('Áudios encontrados dentro do nó adicionado:', audioElements.length);
      audioElements.forEach(processAudioElement);
      // Tenta anexar botões de transcrição em containers customizados dentro do nó adicionado
      try { attachTranscribeButtonsIn(node); } catch (e) { logDebug('attachTranscribeButtonsIn failed on node:', e); }
    });
  });
});

// --- Suporte para players customizados (ex.: estrutura do Chatwoot mostrada pelo usuário)

// Tenta extrair URL do áudio a partir de um container customizado
function getAudioSrcFromContainer(container) {
  try {
    // 1) procura por <audio> no container
    let audio = container.querySelector('audio');

    // Se não encontrou, tenta buscar no pai (wrapper com data-bubble-name="audio")
    if (!audio) {
      const wrapper = container.closest('[data-bubble-name="audio"]');
      if (wrapper) {
        audio = wrapper.querySelector('audio');
      }
    }

    if (audio) {
      if (audio.src) return audio.src;

      const sourceEl = audio.querySelector('source');
      if (sourceEl) {
        return sourceEl.src || sourceEl.getAttribute('src');
      }
    }

    // 2) procura por links contendo extensão de áudio
    const link = Array.from(container.querySelectorAll('a[href]')).find(a => /\.(mp3|ogg|wav|m4a|webm)(\?|$)/i.test(a.href));
    if (link) return link.href;

    // 3) procura por atributos data-src ou data-audio
    const dataElem = container.querySelector('[data-src], [data-audio], [data-url]');
    if (dataElem) {
      return dataElem.getAttribute('data-src') || dataElem.getAttribute('data-audio') || dataElem.getAttribute('data-url');
    }

    // 4) procura botões 'download' com atributo download ou form action
    const downloadAnchor = Array.from(container.querySelectorAll('a')).find(a => a.hasAttribute('download') || /download/i.test(a.textContent));
    if (downloadAnchor && downloadAnchor.href) return downloadAnchor.href;

    // 5) sobe para o wrapper da mensagem e procura por audio/link lá
    const wrapper = container.closest('.message-wrapper, .message, .tw-flex, [data-message-id]');
    if (wrapper) {
      const audio2 = wrapper.querySelector('audio');
      if (audio2 && audio2.src) return audio2.src;
      const link2 = Array.from(wrapper.querySelectorAll('a[href]')).find(a => /\.(mp3|ogg|wav|m4a|webm)(\?|$)/i.test(a.href));
      if (link2) return link2.href;
    }

    return null;
  } catch (err) {
    logDebug('getAudioSrcFromContainer error:', err);
    return null;
  }
}

function insertTranscriptBelowContainer(container, transcriptElement) {
  // Evita duplicação
  const existing = container.parentElement.querySelector('.groq-transcript');
  if (existing) existing.remove();

  // Inserir logo após o container
  if (container.nextSibling) {
    container.parentElement.insertBefore(transcriptElement, container.nextSibling);
  } else {
    container.parentElement.appendChild(transcriptElement);
  }
}

async function transcribeFromUrlForContainer(url, container) {
  if (!url) {
    const errDiv = createTranscriptElement('URL do áudio não encontrada neste player.', 'error');
    insertTranscriptBelowContainer(container, errDiv);
    return;
  }

  // Evita reprocessar
  if (container.dataset.transcribed === 'true' || processingAudios.has(url)) {
    logDebug('Container/URL já processado:', url);
    return;
  }

  processingAudios.add(url);
  container.dataset.transcribed = 'processing';

  const loadingDiv = createTranscriptElement('Transcrevendo áudio...', 'loading');
  insertTranscriptBelowContainer(container, loadingDiv);

  try {
    if (!groqApiKey) {
      await loadApiKey();
      if (!groqApiKey) throw new Error('API Key não configurada.');
    }

    logInfo('Baixando áudio (container)...', url);
    const blob = await fetchAudioBlob(url);
    const ext = getFileExtension(url, blob.type);

    // Garante que o MIME type está correto para o formato
    let mimeType = blob.type;
    if (ext === 'ogg' && (!mimeType || !mimeType.includes('ogg'))) {
      mimeType = 'audio/ogg';
    }

    const file = new File([blob], `audio.${ext}`, { type: mimeType });

    logInfo('Enviando para Groq (container)...', 'arquivo:', file.name, 'tipo:', file.type, 'tamanho:', file.size);
    const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
    const transcription = await groq.audio.transcriptions.create({ file, model: 'whisper-large-v3', response_format: 'json' });
    const transcriptText = transcription && (transcription.text || transcription.transcript || (transcription.data && transcription.data.text)) || '';

    loadingDiv.remove();
    const transcriptDiv = createTranscriptElement(transcriptText || 'Transcrição vazia', 'success');
    insertTranscriptBelowContainer(container, transcriptDiv);

    container.dataset.transcribed = 'true';
  } catch (err) {
    console.error('[Chatwoot Transcriber] Erro transcrevendo (container):', err);
    loadingDiv.remove();
    const errDiv = createTranscriptElement(`Erro: ${err.message || err}`, 'error');
    insertTranscriptBelowContainer(container, errDiv);
    container.dataset.transcribed = 'error';
  } finally {
    processingAudios.delete(url);
  }
}

function createTranscribeButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'groq-transcribe-btn';
  // estilo com z-index e sombra para garantir visibilidade sobre a UI do Chatwoot
  btn.style.cssText = 'margin-left:8px;padding:6px 10px;background:#667eea;color:#fff;border-radius:8px;border:none;cursor:pointer;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.12);z-index:9999';
  btn.textContent = 'Transcrever';
  return btn;
}

function ensureTranscribeButtonOnContainer(container) {
  try {
    // Verifica se já existe um botão nesta mensagem (procura no wrapper da mensagem)
    const wrapper = container.closest('[data-bubble-name="audio"], .message, .message-wrapper');
    if (wrapper && wrapper.querySelector('.groq-transcribe-btn')) return;

    // Procurar o botão de download específico: span.i-lucide-download dentro de um button
    const downloadSpan = container.querySelector('span.i-lucide-download');
    if (!downloadSpan) {
      // Não inserir se não houver o ícone de download — usuário pediu inserção somente após este botão
      logDebug('Nenhum ícone de download encontrado neste container; pulando inserção');
      return;
    }

    const downloadBtn = downloadSpan.closest('button');
    if (!downloadBtn) {
      logDebug('Ícone de download encontrado, mas botão pai não identificado; pulando');
      return;
    }

    // Evita adicionar múltiplas vezes ao mesmo botão de download
    if (downloadBtn.dataset.groqTranscribeAdded === 'true') return;

    const btn = createTranscribeButton();
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      btn.disabled = true;
      btn.textContent = 'Transcrevendo...';
      const url = getAudioSrcFromContainer(container);
      await transcribeFromUrlForContainer(url, container);
      btn.textContent = 'Transcrever';
      btn.disabled = false;
    });

    // Inserir logo após o botão de download
    if (downloadBtn.parentElement) {
      downloadBtn.parentElement.insertBefore(btn, downloadBtn.nextSibling);
    } else {
      container.appendChild(btn);
    }
    downloadBtn.dataset.groqTranscribeAdded = 'true';
    logDebug('Botão Transcrever adicionado após botão de download', downloadBtn);
  } catch (err) {
    logDebug('ensureTranscribeButtonOnContainer error:', err);
  }
}

function attachTranscribeButtonsIn(node) {
  try {
    // procura containers que tenham um input range e um time display (heurística baseada no HTML fornecido)
    const candidates = node.querySelectorAll ? node.querySelectorAll('div') : [];
    candidates.forEach(div => {
      if (!div.querySelector) return;
      const hasRange = !!div.querySelector('input[type="range"]');
      const hasTime = !!div.querySelector('.tabular-nums') || /\b\d{2}:\d{2}\b/.test(div.textContent);
      if (hasRange && hasTime) {
        ensureTranscribeButtonOnContainer(div);
      }
    });

    // busca adicional: containers com a classe skip-context-menu (presente no seu HTML)
    try {
      const skips = node.querySelectorAll ? node.querySelectorAll('.skip-context-menu') : [];
      skips.forEach(el => {
        // Se o elemento for o próprio wrapper do player ou contiver input range/time, adiciona botão
        if (el.querySelector && (el.querySelector('input[type="range"]') || el.querySelector('.tabular-nums') || /\b\d{2}:\d{2}\b/.test(el.textContent))) {
          ensureTranscribeButtonOnContainer(el);
        } else {
          // ainda assim tentar adicionar no filho adequado
          attachTranscribeButtonsIn(el);
        }
      });
    } catch (e) {
      logDebug('extra skip-context-menu scan failed', e);
    }
  } catch (err) {
    logDebug('attachTranscribeButtonsIn error:', err);
  }
}


// Inicia observação quando a página carrega
function init() {
  logInfo('Inicializando observer...');

  // Processa áudios já existentes na página
  const existingAudios = document.querySelectorAll('audio');
  logInfo(`${existingAudios.length} áudios encontrados na página`);
  existingAudios.forEach(processAudioElement);

  // Adiciona botões de transcrição em containers já existentes
  try { attachTranscribeButtonsIn(document.body); } catch (e) { logDebug('attachTranscribeButtonsIn on init failed:', e); }

  // Observa mudanças no DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  logInfo('Observer ativo');
}

// Aguarda o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup ao descarregar
window.addEventListener('beforeunload', () => {
  observer.disconnect();
});
