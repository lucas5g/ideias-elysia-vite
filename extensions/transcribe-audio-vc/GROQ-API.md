# 📚 Informações sobre a API Groq

## 🔑 Obtendo sua API Key

1. Acesse: https://console.groq.com/keys
2. Faça login (crie conta gratuita se necessário)
3. Clique em "Create API Key"
4. Copie a chave (começa com `gsk_`)
5. Cole na extensão

## 💰 Plano Gratuito (Free Tier)

O Groq oferece um plano gratuito generoso:

- **Limite de Requisições**: 14,400 requests/dia (10 req/min)
- **Limite de Tokens**: Varia por modelo
- **Whisper Large V3**: ~60 áudios/minuto
- **Sem necessidade de cartão de crédito**

### Limites Práticos

Para transcrições:
- ✅ Uso pessoal: Mais que suficiente
- ✅ Equipe pequena (5-10 pessoas): OK
- ⚠️ Uso intenso: Considere plano pago

## 🎯 Modelo de Transcrição

A extensão usa: **whisper-large-v3**

### Características:

- **Precisão**: Altíssima (~95% em português)
- **Velocidade**: 2-5 segundos por áudio
- **Idiomas**: Suporta 99+ idiomas
- **Tamanho máximo**: 25 MB por arquivo
- **Duração máxima**: ~30 minutos

### Outros modelos disponíveis:

```javascript
// Em src/contentScript.js, você pode trocar:

model: 'whisper-large-v3'           // Melhor precisão (padrão)
model: 'whisper-large-v3-turbo'     // Mais rápido, boa precisão
model: 'distil-whisper-large-v3-en' // Inglês only, ultra-rápido
```

## 📊 Custos (se você pagar)

O Groq é extremamente barato comparado a outras APIs:

| Modelo | Preço por 1h de áudio |
|--------|----------------------|
| Whisper Large V3 | ~$0.11 |
| OpenAI Whisper | ~$0.36 |
| Google Speech-to-Text | ~$1.44 |

## 🚀 Performance

Tempo médio de transcrição:

| Duração do Áudio | Tempo de Transcrição |
|------------------|---------------------|
| 10 segundos | ~1-2 segundos |
| 30 segundos | ~2-3 segundos |
| 1 minuto | ~3-5 segundos |
| 5 minutos | ~10-15 segundos |

**Velocidade do Groq é ~10-20x mais rápida que OpenAI!**

## 🔒 Segurança e Privacidade

### O que o Groq faz com seus áudios?

De acordo com a política de privacidade:

- ✅ **Não treina modelos com seus dados**
- ✅ **Não armazena áudios permanentemente**
- ✅ **Processamento é efêmero**
- ✅ **Conformidade com GDPR**

### Recomendações:

- ⚠️ Não transcreva dados extremamente sensíveis
- ✅ Para uso empresarial, revise o contrato
- ✅ Audios são enviados via HTTPS (criptografado)

## 🌍 Regiões e Latência

Groq tem data centers em:
- 🇺🇸 Estados Unidos (principal)
- Latência típica do Brasil: 100-200ms

## 📈 Monitoramento de Uso

Você pode monitorar seu uso em:
https://console.groq.com/usage

Veja:
- Requests por dia/hora
- Créditos usados
- Rate limits atingidos

## ⚡ Rate Limits

### Plano Gratuito:

- **Requests por minuto**: 10
- **Requests por dia**: 14,400
- **Tokens por minuto**: 15,000

### O que acontece se exceder?

Você receberá erro `429 Too Many Requests`

**Solução**: 
1. Aguarde 1 minuto
2. Ou faça upgrade do plano

## 🎓 Casos de Uso

A extensão é ideal para:

✅ **Suporte ao cliente**
- Transcrever áudios de clientes
- Criar histórico escrito de conversas
- Facilitar busca em conversas

✅ **Acessibilidade**
- Ajudar pessoas com deficiência auditiva
- Permitir leitura em vez de escuta

✅ **Produtividade**
- Ler mensagens mais rápido que ouvir
- Copiar trechos importantes
- Traduzir facilmente (via outro serviço)

## 🔧 Troubleshooting da API

### Erro 401 - Unauthorized
**Causa**: API key inválida
**Solução**: Gere nova key em console.groq.com

### Erro 429 - Rate Limit
**Causa**: Muitas requisições
**Solução**: Aguarde ou faça upgrade

### Erro 500 - Server Error
**Causa**: Problema temporário do Groq
**Solução**: Tente novamente em alguns minutos

### Erro 413 - Payload Too Large
**Causa**: Áudio muito grande (>25 MB)
**Solução**: Áudio precisa ser comprimido

## 📱 Formatos Suportados

O Whisper da Groq aceita:

✅ **Formatos de áudio**:
- MP3
- MP4 (audio)
- MPEG
- MPGA
- M4A
- WAV
- WEBM
- OGG

⚠️ **Não suportados**:
- Vídeos (apenas áudio)
- Formatos proprietários

## 🌐 Comparação com Alternativas

| Serviço | Velocidade | Precisão | Preço (1h) | Plano Grátis |
|---------|-----------|----------|-----------|--------------|
| **Groq** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $0.11 | ✅ Generoso |
| OpenAI | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $0.36 | ❌ |
| Google | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $1.44 | ✅ Limitado |
| AWS | ⚡⚡⚡ | ⭐⭐⭐⭐ | $0.024/min | ✅ Limitado |
| Azure | ⚡⚡⚡ | ⭐⭐⭐⭐ | $1.00 | ✅ Limitado |

**Groq é a melhor escolha para esta extensão!**

## 📖 Documentação Oficial

- **API Docs**: https://console.groq.com/docs
- **Whisper Docs**: https://platform.openai.com/docs/guides/speech-to-text
- **Playground**: https://console.groq.com/playground
- **Status Page**: https://status.groq.com

## 💡 Dicas Avançadas

### 1. Otimizar para idioma específico

```javascript
language: 'pt' // Força português, melhora precisão
```

### 2. Ajustar temperatura

```javascript
temperature: 0.0  // Mais consistente (recomendado)
temperature: 0.3  // Mais criativo (para podcasts)
```

### 3. Timestamp de palavras

```javascript
response_format: 'verbose_json' // Inclui timestamps
```

Depois você pode acessar:
```javascript
transcription.segments // Array com timestamps
```

## 🎯 Melhores Práticas

1. **Valide API key antes de usar**
2. **Implemente retry com exponential backoff**
3. **Cache transcrições para não repetir**
4. **Monitore rate limits**
5. **Trate erros graciosamente**

A extensão já implementa tudo isso! ✅

---

**Mais informações**: https://wow.groq.com
