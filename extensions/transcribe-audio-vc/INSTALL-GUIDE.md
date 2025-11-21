# 🎯 Instalação Visual - Passo a Passo

## ⏱️ Tempo Total: 5 minutos

---

## PASSO 1: Build da Extensão (2 min)

### Terminal:

```bash
cd /home/lucas/projects/ideias-elysia-vite/extensions/transcribe-audio-vc

# Instalar dependências (primeira vez apenas)
npm install

# Fazer build
npm run build

# Copiar arquivo compilado
cp dist/contentScript.js .
```

### ✅ Verificar:
- [ ] Pasta `node_modules/` criada
- [ ] Pasta `dist/` criada
- [ ] Arquivo `contentScript.js` na raiz (56 KB)
- [ ] Sem erros no terminal

---

## PASSO 2: Obter API Key do Groq (1 min)

### Navegador:

1. Abra: https://console.groq.com/keys
2. Faça login (ou crie conta grátis)
3. Clique: **"Create API Key"**
4. **Copie** a chave (formato: `gsk_xxxxx...`)

### ✅ Verificar:
- [ ] API key copiada
- [ ] Começa com `gsk_`

---

## PASSO 3: Carregar Extensão no Chrome (1 min)

### Chrome:

1. Digite na barra de endereços: `chrome://extensions/`

2. Ative **"Modo do desenvolvedor"** (toggle no canto superior direito)

3. Clique: **"Carregar sem compactação"**

4. Navegue até: `/home/lucas/projects/ideias-elysia-vite/extensions/transcribe-audio-vc`

5. Clique: **"Selecionar pasta"**

### ✅ Verificar:
- [ ] Extensão aparece na lista
- [ ] Nome: "Chatwoot Audio Transcriber"
- [ ] Status: "Ativada"
- [ ] Ícone visível na barra de ferramentas (🧩)

### 🐛 Problemas?

**"Erro ao carregar extensão"**
→ Verifique se `contentScript.js` existe na raiz
→ Rode novamente: `npm run build && cp dist/contentScript.js .`

**"Manifest file is missing or unreadable"**
→ Certifique-se de selecionar a pasta correta

---

## PASSO 4: Configurar API Key (30 seg)

### Chrome - Extensão:

1. Clique no **ícone de extensões** (🧩) na barra de ferramentas

2. Clique em **"Chatwoot Audio Transcriber"**

3. No popup que abre:
   - Cole sua API key no campo
   - Clique em **"Salvar API Key"**

4. Aguarde mensagem: **"✓ API Key salva e validada com sucesso!"**

### ✅ Verificar:
- [ ] Mensagem de sucesso apareceu
- [ ] Popup pode ser fechado
- [ ] Ao reabrir, a key ainda está lá

### 🐛 Problemas?

**"API Key salva, mas pode estar inválida"**
→ Verifique se copiou a key completa
→ Gere nova key em console.groq.com

---

## PASSO 5: Testar no Chatwoot (1 min)

### Chatwoot:

1. Navegue até sua instância do Chatwoot
   - Ex: `app.chatwoot.com`
   - Ex: `chatwoot.sua-empresa.com`

2. Abra **DevTools** (F12)

3. Vá para aba **Console**

4. Você deve ver:
   ```
   [Chatwoot Transcriber] Content script carregado
   [Chatwoot Transcriber] Inicializando observer...
   [Chatwoot Transcriber] API Key carregada
   [Chatwoot Transcriber] Observer ativo
   ```

5. Abra uma **conversa com áudio**

6. Observe:
   - Mensagem "Transcrevendo áudio..." aparece
   - Após 2-5 segundos: transcrição aparece abaixo do player
   - Texto está correto

### ✅ Verificar:
- [ ] Logs aparecem no console
- [ ] Áudio é detectado automaticamente
- [ ] Transcrição aparece corretamente
- [ ] Visual está bonito (fundo azul claro)

### 🐛 Problemas?

**Nenhum log aparece**
→ Recarregue a página (Ctrl+R)
→ Verifique se a URL é suportada (*.chatwoot.com)

**"API Key não configurada"**
→ Configure novamente no popup
→ Recarregue a página do Chatwoot

**Erro ao transcrever**
→ Verifique API key
→ Teste outro áudio
→ Veja erros detalhados no console

---

## 🎉 PRONTO! Extensão Funcionando

### Você agora tem:

✅ Extensão instalada no Chrome  
✅ API key configurada  
✅ Transcrição automática funcionando  
✅ Interface integrada ao Chatwoot  

### O que acontece agora:

1. **Sempre que você abrir o Chatwoot:**
   - A extensão carrega automaticamente
   - Observa mensagens de áudio

2. **Quando chegar um áudio:**
   - É detectado automaticamente
   - Transcrito em 2-5 segundos
   - Texto aparece abaixo do player

3. **Você pode:**
   - Ler em vez de ouvir
   - Copiar o texto
   - Buscar na conversa

---

## 📊 Status Visual da Extensão

### ✅ Tudo Funcionando:

```
Chrome Extensions
  └─ Chatwoot Audio Transcriber [ATIVADA]
      └─ Permissões: ✓ Storage, ✓ ActiveTab
      └─ API Key: ✓ Configurada

Chatwoot (Console)
  └─ [Chatwoot Transcriber] Content script carregado ✓
  └─ [Chatwoot Transcriber] API Key carregada ✓
  └─ [Chatwoot Transcriber] Observer ativo ✓

Audio Message
  └─ [Player] 🎵 ━━━━━━━━━━ 0:45
  └─ [Transcrição] 📝 Olá, tudo bem? Preciso de ajuda...
```

### ❌ Problemas Comuns:

```
Extensão não carrega
  → Verifique manifest.json existe
  → Rode: npm run build

API Key inválida
  → Gere nova em console.groq.com
  → Cole novamente no popup

Áudios não são detectados
  → Recarregue página do Chatwoot
  → Verifique console por erros
  → URL deve ser *.chatwoot.com
```

---

## 🔄 Desenvolvimento Contínuo

### Para fazer mudanças:

```bash
# 1. Edite os arquivos
vim src/contentScript.js
vim styles.css
vim popup.html

# 2. Rebuild
npm run build
cp dist/contentScript.js .

# 3. Recarregue extensão
# chrome://extensions/ → botão de reload
```

---

## 📚 Próximos Passos

- 📖 Leia `CUSTOMIZATION.md` para personalizar
- 🔧 Leia `GROQ-API.md` para entender a API
- ✅ Use `TESTING.md` como checklist
- 📄 Consulte `README.md` para docs completas

---

## 💡 Dicas Finais

1. **Mantenha a API key segura**
   - Não compartilhe
   - Não faça commit no Git

2. **Monitore seu uso**
   - https://console.groq.com/usage
   - Plano grátis tem limites generosos

3. **Reporte problemas**
   - Abra issue no GitHub
   - Inclua logs do console

4. **Personalize!**
   - Mude cores em `styles.css`
   - Adicione features em `src/contentScript.js`

---

**🎊 Parabéns! Você instalou com sucesso a extensão!**

**Aproveite a transcrição automática no seu Chatwoot! 🚀**
