// background.js - Service Worker para baixar áudios sem restrições CORS

console.log('[Background] Service worker iniciado');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Mensagem recebida:', message.type, message.url);

  if (message.type === 'FETCH_AUDIO') {
    // Baixa o áudio sem restrições CORS (background scripts não têm essa limitação)
    fetch(message.url, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        console.log('[Background] Fetch response:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        console.log('[Background] Blob recebido:', blob.size, 'bytes, tipo:', blob.type);
        // Converte blob para base64 para enviar via mensagem
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('[Background] Base64 criado, enviando resposta');
          sendResponse({
            success: true,
            data: reader.result, // base64
            type: blob.type,
            size: blob.size
          });
        };
        reader.onerror = () => {
          console.error('[Background] Erro ao ler blob');
          sendResponse({
            success: false,
            error: 'Erro ao ler blob'
          });
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('[Background] Erro no fetch:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });

    // Retorna true para indicar que a resposta será assíncrona
    return true;
  }
});
