// popup.js - Gerencia a configuração da API Key

const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');

// Carrega a API key salva ao abrir o popup
chrome.storage.sync.get(['groq_api_key'], (result) => {
  if (result.groq_api_key) {
    apiKeyInput.value = result.groq_api_key;
    showStatus('API Key carregada com sucesso!', 'info');
  }
});

// Salva a API key
saveBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showStatus('Por favor, insira uma API Key válida', 'error');
    return;
  }

  if (!apiKey.startsWith('gsk_')) {
    showStatus('A API Key do Groq geralmente começa com "gsk_"', 'error');
    return;
  }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    // Salva no storage
    await chrome.storage.sync.set({ groq_api_key: apiKey });

    // Testa a API key fazendo uma chamada simples
    const isValid = await testApiKey(apiKey);

    if (isValid) {
      showStatus('✓ API Key salva e validada com sucesso!', 'success');

      // Notifica os content scripts que a key foi atualizada
      chrome.tabs.query({ url: ['*://*.chatwoot.com/*', '*://*.chatwoot.app/*', '*://*.chatwoot.cloud/*', 'http://localhost:*/*'] }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: 'API_KEY_UPDATED' }).catch(() => {
            // Ignora erro se o content script não estiver carregado
          });
        });
      });
    } else {
      showStatus('⚠ API Key salva, mas pode estar inválida. Verifique em console.groq.com', 'error');
    }
  } catch (error) {
    console.error('Erro ao salvar API Key:', error);
    showStatus('Erro ao salvar: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar API Key';
  }
});

// Função para testar se a API key é válida
async function testApiKey(apiKey) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao testar API key:', error);
    return false;
  }
}

// Mostra mensagem de status
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';

  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
}

// Permite salvar com Enter
apiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveBtn.click();
  }
});
