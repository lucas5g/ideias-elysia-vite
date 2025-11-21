# ✅ Checklist de Instalação e Teste

Use este guia para garantir que tudo está funcionando corretamente.

## 📋 Pré-instalação

- [ ] Node.js instalado (v16 ou superior)
- [ ] npm funcionando
- [ ] Google Chrome instalado
- [ ] Conta Groq criada (gratuita em console.groq.com)

## 🔨 Build

- [ ] Executar `npm install` (sem erros)
- [ ] Executar `npm run build` (cria dist/contentScript.js)
- [ ] Arquivo `contentScript.js` existe na raiz do projeto
- [ ] Pasta `icons/` contém icon16.png, icon48.png, icon128.png

## 🚀 Instalação no Chrome

- [ ] Acessar `chrome://extensions/`
- [ ] Ativar "Modo do desenvolvedor" (canto superior direito)
- [ ] Clicar em "Carregar sem compactação"
- [ ] Selecionar a pasta `transcribe-audio-vc`
- [ ] Extensão aparece na lista (sem erros)
- [ ] Ícone da extensão visível na barra de ferramentas

## ⚙️ Configuração

- [ ] Clicar no ícone da extensão
- [ ] Popup abre corretamente
- [ ] Input de API key visível
- [ ] Inserir API key do Groq (começa com `gsk_`)
- [ ] Clicar em "Salvar API Key"
- [ ] Mensagem de sucesso aparece
- [ ] Fechar e reabrir popup
- [ ] API key ainda está salva (campo preenchido)

## 🧪 Teste no Chatwoot

### Setup do Teste

- [ ] Acessar instância do Chatwoot
- [ ] Abrir DevTools (F12)
- [ ] Ir para aba Console
- [ ] Verificar mensagem: `[Chatwoot Transcriber] Content script carregado`
- [ ] Verificar mensagem: `[Chatwoot Transcriber] API Key carregada`

### Teste com Áudio

- [ ] Abrir conversa com mensagem de áudio
- [ ] Elemento `<audio>` visível na página
- [ ] No console, verificar: `[Chatwoot Transcriber] Iniciando transcrição`
- [ ] Mensagem "Transcrevendo áudio..." aparece abaixo do player
- [ ] Após alguns segundos, transcrição aparece
- [ ] Texto da transcrição está correto/compreensível
- [ ] Estilo visual da transcrição está aplicado (fundo azul claro)

### Teste de Múltiplos Áudios

- [ ] Abrir conversa com vários áudios
- [ ] Todos os áudios são transcritos
- [ ] Nenhum áudio é transcrito duas vezes
- [ ] Transcrições aparecem nos lugares corretos

## 🔍 Verificação de Erros Comuns

### ❌ "API Key não configurada"

**Solução:**
- [ ] Abrir popup da extensão
- [ ] Configurar API key válida do Groq
- [ ] Recarregar página do Chatwoot

### ❌ "Falha ao baixar áudio"

**Solução:**
- [ ] Verificar conexão com internet
- [ ] Verificar permissões da extensão
- [ ] Tentar com outro áudio

### ❌ "Erro 401 Unauthorized"

**Solução:**
- [ ] API key está incorreta
- [ ] Gerar nova API key em console.groq.com
- [ ] Substituir no popup

### ❌ "Erro 429 Rate Limit"

**Solução:**
- [ ] Aguardar alguns minutos
- [ ] Verificar limites da conta em console.groq.com
- [ ] Considerar upgrade do plano se necessário

### ❌ Áudios não são detectados

**Solução:**
- [ ] Recarregar página do Chatwoot
- [ ] Verificar no console se há erros
- [ ] Confirmar que é uma URL suportada (*.chatwoot.com, etc.)

## 📊 Logs de Debug

No Console do DevTools, você deve ver:

```
[Chatwoot Transcriber] Content script carregado
[Chatwoot Transcriber] Inicializando observer...
[Chatwoot Transcriber] API Key carregada
[Chatwoot Transcriber] Observer ativo
[Chatwoot Transcriber] Iniciando transcrição: https://...
[Chatwoot Transcriber] Baixando áudio...
[Chatwoot Transcriber] Áudio baixado: 45231 bytes, tipo: audio/ogg
[Chatwoot Transcriber] Enviando para Groq...
[Chatwoot Transcriber] Transcrição recebida: [texto aqui]
```

## ✅ Checklist de Sucesso

Sua extensão está funcionando se:

- [x] Popup abre e salva API key
- [x] Content script carrega em páginas do Chatwoot
- [x] Áudios são detectados automaticamente
- [x] Transcrições aparecem corretamente
- [x] Sem erros no console
- [x] Interface do Chatwoot não quebra

## 🎉 Tudo Funcionando?

Se todos os checkboxes acima estão marcados, parabéns! 

Sua extensão está pronta para uso.

## 🐛 Ainda com Problemas?

1. Verifique o README.md completo
2. Revise os logs no console
3. Tente com uma nova API key
4. Reconstrua a extensão: `npm run build && cp dist/contentScript.js .`
5. Abra uma issue no repositório

---

**Última atualização:** v1.0.0
