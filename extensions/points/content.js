
// Função para processar as horas
function processarHoras() {

  // Verificar iframes
  const iframes = document.querySelectorAll('iframe')

  let docToSearch = document
  let dentroDeIframe = false

  // Se tem iframes, tentar acessar o conteúdo deles
  if (iframes.length > 0) {
    for (let iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc) {
          const painelInIframe = iframeDoc.querySelector('#painel')
          if (painelInIframe) {
            docToSearch = iframeDoc
            dentroDeIframe = true
            break
          }
        }
      } catch (e) {
      }
    }
  }

  // Verificar se o elemento #painel existe
  let painel = docToSearch.querySelector('#painel')

  // Se não encontrou, tentar buscar qualquer elemento com id painel
  if (!painel) {
    painel = docToSearch.getElementById('painel')
  }


  if (!painel) {
    return false
  }

  // Tentar diferentes formas de encontrar os horários
  let hours = docToSearch.querySelectorAll('#painel > center:nth-child(9) > div > table > tbody > tr:nth-child(2) > td')

  // Se não encontrou, tentar buscar todos os td dentro do painel
  if (hours.length === 0) {
    hours = painel.querySelectorAll('table td')
  }

  // Extrair os horários
  const times = []
  hours.forEach(td => {
    const text = td.innerText.trim()
    // Filtrar apenas horários no formato HH:MM
    if (text && /^\d{2}:\d{2}$/.test(text)) {
      times.push(text)
    } else if (text) {
    }
  })

  // Função para mostrar o toast
  function mostrarToast(mensagem, cor = '#4CAF50') {
    const existingElement = document.getElementById('controle-horas-total')
    if (existingElement) {
      existingElement.remove()
    }

    const totalElement = document.createElement('div')
    totalElement.id = 'controle-horas-total'
    totalElement.style.cssText = `position: fixed; top: 10px; right: 10px; background: ${cor}; color: white; padding: 15px 20px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000;`
    totalElement.textContent = mensagem
    document.body.appendChild(totalElement)
  }

  if (times.length === 0) {
    mostrarToast('⚠️ Aguardando horários...', '#FF9800')
    return false
  }

  // Função para converter horário (HH:MM) em minutos
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Função para obter horário atual no formato HH:MM
  function getHorarioAtual() {
    const agora = new Date()
    const horas = agora.getHours().toString().padStart(2, '0')
    const minutos = agora.getMinutes().toString().padStart(2, '0')
    return `${horas}:${minutos}`
  }

  // Calcular horas trabalhadas
  let totalMinutes = 0
  const periodos = []

  // Processar pares de entrada/saída
  for (let i = 0; i < times.length; i += 2) {
    const entrada = times[i]
    let saida = times[i + 1]

    // Se não tem saída (último registro), usar horário atual
    if (!saida) {
      saida = getHorarioAtual()
    }

    const entradaMinutos = timeToMinutes(entrada)
    const saidaMinutos = timeToMinutes(saida)
    const diff = saidaMinutos - entradaMinutos

    if (diff > 0) {
      totalMinutes += diff
      const diffHoras = Math.floor(diff / 60)
      const diffMins = diff % 60
      periodos.push(`${entrada} - ${saida} = ${diffHoras}h ${diffMins.toString().padStart(2, '0')}min`)
    }
  }

  // Converter total de volta para horas e minutos
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60


  // Exibir na página
  mostrarToast(`⏱️ Total: ${totalHours}h ${totalMins.toString().padStart(2, '0')}min`)

  return true
}

// Tentar processar imediatamente
if (!processarHoras()) {
  // Se não encontrou, aguardar o DOM carregar

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (!processarHoras()) {
          // Tentar novamente após 2 segundos
          setTimeout(processarHoras, 2000)
        }
      }, 1000)
    })
  } else {
    // DOM já carregado, tentar novamente com intervalos maiores
    setTimeout(() => {
      if (!processarHoras()) {
        setTimeout(processarHoras, 2000)
      }
    }, 1000)

    // Observador para detectar quando iframes carregarem
    const observer = new MutationObserver(() => {
      const iframes = document.querySelectorAll('iframe')
      if (iframes.length > 0) {
        iframes.forEach(iframe => {
          iframe.addEventListener('load', () => {
            setTimeout(processarHoras, 500)
          })
        })
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Parar de observar após 30 segundos
    setTimeout(() => observer.disconnect(), 30000)
  }
}