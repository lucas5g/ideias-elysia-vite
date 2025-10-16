import { useEffect, useRef, useState } from 'react'

export function Audiobook() {
  const [videoId, setVideoId] = useState<string>('')
  const [videoInput, setVideoInput] = useState('')
  const playerRef = useRef<any>(null)
  const timeoutRef = useRef<number | null>(null)
  const pauseMinutesRef = useRef<number>(1)
  const [pauseMinutes, setPauseMinutes] = useState<number>(1)

  useEffect(() => {
    // Só carregar se houver videoId
    if (!videoId) {
      return
    }
    // Limpar player existente se houver
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }

    // Sistema para manter áudio tocando no mobile
    const setupMobileAudio = () => {
      // Prevenir sleep no mobile quando possível
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {
          console.log('Wake lock não disponível')
        })
      }

      // Salvar estado do vídeo para recuperar depois
      const saveVideoState = () => {
        if (playerRef.current) {
          try {
            const currentTime = playerRef.current.getCurrentTime()
            const isPlaying = playerRef.current.getPlayerState() === 1
            localStorage.setItem('audiobook_state', JSON.stringify({
              videoId,
              currentTime,
              isPlaying,
              pauseMinutes: pauseMinutesRef.current,
              timestamp: Date.now()
            }))
            console.log('Estado salvo:', { currentTime, isPlaying })
          } catch (error) {
            console.log('Erro ao salvar estado:', error)
          }
        }
      }

      // Eventos para salvar estado quando sair da página
      const handleVisibilityChange = () => {
        if (document.hidden) {
          saveVideoState()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', saveVideoState)
      window.addEventListener('pagehide', saveVideoState)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', saveVideoState)
        window.removeEventListener('pagehide', saveVideoState)
      }
    }

    const cleanupMobile = setupMobileAudio()

    // Carregar a API do YouTube Player
    const loadYouTubeAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }

      // Função chamada quando a API está pronta
      ;(window as any).onYouTubeIframeAPIReady = () => {
        if (document.getElementById('youtube-player')) {
          playerRef.current = new (window as any).YT.Player('youtube-player', {
            height: window.innerWidth < 600 ? '250' : '315',
            width: window.innerWidth < 600 ? '350' : '560',
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              playsinline: 1, // Importante para iOS - permite tocar inline sem fullscreen
              rel: 0, // Não mostrar vídeos relacionados
            },
            events: {
              onReady: (event: any) => {
                console.log('Player ready')
                
                // Recuperar estado salvo se existir
                try {
                  const savedState = localStorage.getItem('audiobook_state')
                  if (savedState) {
                    const state = JSON.parse(savedState)
                    // Verificar se é o mesmo vídeo e se foi salvo recentemente (última hora)
                    if (state.videoId === videoId && 
                        state.currentTime && 
                        (Date.now() - state.timestamp) < 3600000) {
                      
                      console.log('Recuperando estado:', state)
                      event.target.seekTo(state.currentTime)
                      
                      if (state.isPlaying) {
                        // Pequeno delay para garantir que o seek funcionou
                        setTimeout(() => {
                          event.target.playVideo()
                        }, 1000)
                      }
                    }
                  }
                } catch (error) {
                  console.log('Erro ao recuperar estado:', error)
                }
              },
              onStateChange: (event: any) => {
                console.log('Estado do vídeo:', event.data)
                
                // Se o vídeo começou a tocar
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  const currentMinutes = pauseMinutesRef.current
                  const timeInMs = currentMinutes * 60 * 1000
                  console.log(`Vídeo começou a tocar - pausará em ${currentMinutes} minutos`)
                  
                  // Limpar timer anterior se existir
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                  }
                  
                  // Criar novo timer para pausar
                  timeoutRef.current = setTimeout(() => {
                    console.log(`Pausando vídeo após ${currentMinutes} minutos`)
                    if (playerRef.current) {
                      playerRef.current.pauseVideo()
                    }
                  }, timeInMs)
                }
                
                // Se o vídeo foi pausado, limpar o timer
                if (event.data === (window as any).YT.PlayerState.PAUSED) {
                  console.log('Vídeo pausado - limpando timer')
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                    timeoutRef.current = null
                  }
                }
              }
            }
          })
        }
      }

      // Se a API já estiver carregada
      if ((window as any).YT && (window as any).YT.Player) {
        ;(window as any).onYouTubeIframeAPIReady()
      }
    }

    loadYouTubeAPI()

    return () => {
      // Limpar timer e eventos mobile
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      cleanupMobile()
    }
  }, [videoId]) // videoId como dependência para recriar quando mudar

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setPauseMinutes(value)
      pauseMinutesRef.current = value
      
      // Se há um timer ativo, reiniciar com novo valor
      if (timeoutRef.current && playerRef.current) {
        const playerState = playerRef.current.getPlayerState()
        if (playerState === 1) { // 1 = PLAYING
          clearTimeout(timeoutRef.current)
          const timeInMs = value * 60 * 1000
          timeoutRef.current = setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.pauseVideo()
            }
          }, timeInMs)
          console.log(`Timer atualizado para ${value} minutos`)
        }
      }
    }
  }

  const extractVideoId = (url: string): string => {
    // Extrair ID do vídeo de diferentes formatos de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID direto
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return url // Retorna o que foi digitado se não conseguir extrair
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoInput(e.target.value)
  }

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (videoInput.trim()) {
      const newVideoId = extractVideoId(videoInput.trim())
      setVideoId(newVideoId)
      console.log('Novo vídeo ID:', newVideoId)
    }
  }

  return (
    <main>
      <div className="card">
        <h1>Audio</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="video-input" style={{ display: 'block', marginBottom: '5px' }}>
            URL ou ID do vídeo do YouTube:
          </label>
          <form onSubmit={handleVideoSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              id="video-input"
              type="text"
              value={videoInput}
              onChange={handleVideoChange}
              placeholder="Cole a URL ou ID do vídeo aqui"
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                flex: 1,
                minWidth: '300px'
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Carregar
            </button>
          </form>
          <small style={{ color: '#666' }}>
            Exemplos: https://www.youtube.com/watch?v=RyBTJTCmd0A ou apenas RyBTJTCmd0A
          </small>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="pause-minutes" style={{ display: 'block', marginBottom: '5px' }}>
            Pausar vídeo após (minutos):
          </label>
          <input
            id="pause-minutes"
            type="number"
            min="1"
            value={pauseMinutes}
            onChange={handleMinutesChange}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100px'
            }}
          />
          <span style={{ marginLeft: '10px' }}>minutos</span>
        </div>

        {videoId ? (
          <>
            <div id="youtube-player"></div>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                📱 <strong>Dica para Mobile:</strong> O vídeo continuará onde parou mesmo se você fechar o navegador
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                🎵 Vídeo atual: {videoId}<br/>
                ⏰ Pausa automática após {pauseMinutes} minuto{pauseMinutes > 1 ? 's' : ''}
              </p>
            </div>
          </>
        ) : (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            border: '2px dashed #ccc', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <p style={{ color: '#666', fontSize: '18px' }}>
              Cole uma URL ou ID do YouTube acima para carregar um vídeo
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
