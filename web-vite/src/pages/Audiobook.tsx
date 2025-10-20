import { useEffect, useRef, useState } from 'react'

interface SavedVideo {
  id: number // ID do backend (autoincrement)
  title: string
  url: string
  currentTime: number
  pauseMinutes?: number
  lastPlayed?: string // ISO string do backend
  createdAt: string
  updatedAt: string
}

interface VideoPayload {
  title: string
  url: string
  currentTime: number
  pauseMinutes: number
  lastPlayed: string
}


const API_BASE_URL = 'https://api.dizelequefez.com.br'

// Função para buscar vídeos da API
const fetchVideos = async (): Promise<SavedVideo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`)
    if (!response.ok) throw new Error('Erro ao buscar vídeos')
    const videos = await response.json()
    return videos
  } catch (error) {
    console.error('Erro ao carregar biblioteca:', error)
    return []
  }
}

// Função para salvar/atualizar vídeo na API
const saveVideoToAPI = async (videoData: VideoPayload): Promise<SavedVideo | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    })

    if (!response.ok) throw new Error('Erro ao salvar vídeo')
    const savedVideo = await response.json()
    return savedVideo
  } catch (error) {
    console.error('Erro ao salvar vídeo:', error)
    return null
  }
}

// Função para atualizar vídeo na API
const updateVideoInAPI = async (id: number, videoData: Partial<VideoPayload>): Promise<SavedVideo | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    })

    if (!response.ok) throw new Error('Erro ao atualizar vídeo')
    const updatedVideo = await response.json()
    return updatedVideo
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error)
    return null
  }
}

// Função para deletar vídeo da API
const deleteVideoFromAPI = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error)
    return false
  }
}

export function Audiobook() {
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null) // ID da API
  const [youtubeId, setYoutubeId] = useState<string>('') // ID do YouTube (ex: dQw4w9WgXcQ)
  const [videoInput, setVideoInput] = useState('')
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [showLibrary, setShowLibrary] = useState<boolean>(false)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState<boolean>(false)
  const playerRef = useRef<any>(null)
  const timeoutRef = useRef<number | null>(null)
  const pauseMinutesRef = useRef<number>(1)
  const [pauseMinutes, setPauseMinutes] = useState<number>(1)
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // Segundos restantes
  const [isPlaying, setIsPlaying] = useState<boolean>(false) // Se o vídeo está tocando

  const extractVideoId = (url: string): string => {
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

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (videoInput.trim()) {
      const newYoutubeId = extractVideoId(videoInput.trim())
      setYoutubeId(newYoutubeId)
      console.log('Carregando e salvando vídeo automaticamente...')
    }
  }

  const loadVideo = (savedVideo: SavedVideo) => {
    console.log('Carregando vídeo da biblioteca:', savedVideo.title)
    const youtubeIdFromUrl = extractVideoId(savedVideo.url)
    setYoutubeId(youtubeIdFromUrl)
    setCurrentVideoId(savedVideo.id)
    setVideoInput(savedVideo.url)
    setShowLibrary(false)

    // Atualizar lastPlayed via API
    // TODO: Implementar updateVideoInAPI
  }

  const removeVideo = async (videoIdToRemove: number) => {
    try {
      await deleteVideoFromAPI(videoIdToRemove)
      setSavedVideos(prev => prev.filter(v => v.id !== videoIdToRemove))
      console.log('Vídeo removido da biblioteca:', videoIdToRemove)
    } catch (error) {
      console.error('Erro ao remover vídeo:', error)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h atrás`
    if (diffInHours < 48) return 'Ontem'
    return date.toLocaleDateString('pt-BR')
  }

  const getLibraryDescription = () => {
    if (savedVideos.length === 0) return 'Nenhum vídeo salvo ainda'
    if (savedVideos.length === 1) return '1 vídeo salvo'
    return `${savedVideos.length} vídeos salvos`
  }

  // Função para salvar estado do vídeo (localStorage + API)
  const saveVideoState = async () => {
    if (playerRef.current) {
      try {
        const currentTime = playerRef.current.getCurrentTime()
        const isPlaying = playerRef.current.getPlayerState() === 1

        // Salvar no localStorage (backup)
        localStorage.setItem('audiobook_state', JSON.stringify({
          youtubeId,
          currentTime,
          isPlaying,
          pauseMinutes: pauseMinutesRef.current,
          timestamp: Date.now()
        }))

        // Se temos o ID do vídeo na API, salvar via PATCH
        if (currentVideoId) {
          try {
            await updateVideoInAPI(currentVideoId, {
              currentTime: Math.floor(currentTime),
              lastPlayed: new Date().toISOString()
            })
            console.log('Estado salvo na API:', { currentTime, isPlaying, currentVideoId })
          } catch (apiError) {
            console.log('Erro ao salvar na API:', apiError)
          }
        }

        console.log('Estado salvo localmente:', { currentTime, isPlaying })
      } catch (error) {
        console.log('Erro ao salvar estado:', error)
      }
    }
  }

  // Carregar vídeos salvos da API
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const videos = await fetchVideos()
        setSavedVideos(videos)
        console.log('Biblioteca carregada da API:', videos.length, 'vídeos')
        setIsLibraryLoaded(true)
      } catch (error) {
        console.error('Erro ao carregar biblioteca:', error)
        setIsLibraryLoaded(true)
      }
    }

    loadLibrary()
  }, [])

  // Salvar vídeos no localStorage apenas depois que a biblioteca foi carregada
  useEffect(() => {
    if (isLibraryLoaded) {
      localStorage.setItem('audiobook_library', JSON.stringify(savedVideos))
      console.log('Biblioteca salva:', savedVideos.length, 'vídeos')
    }
  }, [savedVideos, isLibraryLoaded])

  useEffect(() => {
    // Só carregar se houver youtubeId
    if (!youtubeId) {
      return
    }
    // Limpar player existente se houver
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }  // Sistema para manter áudio tocando no mobile
    const setupMobileAudio = () => {
      // Prevenir sleep no mobile quando possível
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {
          console.log('Wake lock não disponível')
        })
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
      ; (window as any).onYouTubeIframeAPIReady = () => {
        if (document.getElementById('youtube-player')) {
          const container = document.getElementById('youtube-player')
          const containerWidth = Math.min(container?.parentElement?.offsetWidth || 320, 640) // Limita largura máxima para 640px

          // Detectar se é desktop (largura > 768px) ou mobile
          const isDesktop = window.innerWidth > 768
          const aspectRatio = isDesktop ? 0.30 : 0.5625 // 30% altura no desktop, 16:9 no mobile
          const containerHeight = Math.round(containerWidth * aspectRatio)

          playerRef.current = new (window as any).YT.Player('youtube-player', {
            height: containerHeight,
            width: containerWidth,
            videoId: youtubeId,
            playerVars: {
              autoplay: 0,
              playsinline: 1, // Importante para iOS - permite tocar inline sem fullscreen
              rel: 0, // Não mostrar vídeos relacionados
              modestbranding: 1, // Remove logo YouTube
              fs: 1, // Permite fullscreen
              controls: 1 // Mostra controles
            },
            events: {
              onReady: async (event: any) => {
                console.log('Player ready')

                // Capturar título do vídeo
                let capturedTitle = youtubeId
                try {
                  const title = event.target.getVideoData().title
                  capturedTitle = title || youtubeId
                } catch (error) {
                  console.log('Erro ao capturar título:', error)
                  capturedTitle = youtubeId
                }

                // Auto-salvar vídeo na API quando título for capturado
                if (!currentVideoId && videoInput.trim()) {
                  try {
                    // Verificar se já existe na biblioteca
                    const existingVideo = savedVideos.find(v => v.url === videoInput.trim())
                    if (existingVideo) {
                      setCurrentVideoId(existingVideo.id)
                      console.log('Vídeo já existe na biblioteca, usando ID:', existingVideo.id)
                    } else {
                      // Criar novo vídeo na API
                      const newVideo = await saveVideoToAPI({
                        title: capturedTitle,
                        url: videoInput.trim(),
                        currentTime: 0,
                        pauseMinutes: pauseMinutes,
                        lastPlayed: new Date().toISOString()
                      })

                      if (newVideo) {
                        setCurrentVideoId(newVideo.id)
                        setSavedVideos(prev => [newVideo, ...prev])
                        console.log('✅ Vídeo salvo automaticamente na biblioteca:', newVideo.title)
                      }
                    }
                  } catch (error) {
                    console.error('Erro ao auto-salvar vídeo:', error)
                  }
                }

                // Recuperar estado salvo da API
                try {
                  if (currentVideoId) {
                    // Buscar da API usando o ID do vídeo
                    const response = await fetch(`https://api.dizelequefez.com.br/videos`)
                    if (response.ok) {
                      const videos: SavedVideo[] = await response.json()
                      const currentVideo = videos.find(v => v.id === currentVideoId)

                      if (currentVideo && currentVideo.currentTime > 0) {
                        console.log('Recuperando estado da API:', {
                          currentTime: currentVideo.currentTime,
                          title: currentVideo.title
                        })

                        event.target.seekTo(currentVideo.currentTime)

                        // Pequeno delay para garantir que o seek funcionou
                        setTimeout(() => {
                          // Não auto-play, deixar usuário decidir quando reproduzir
                          console.log(`Vídeo posicionado em ${currentVideo.currentTime}s`)
                        }, 1000)
                      }
                    }
                  } else {
                    // Fallback para localStorage se não tiver currentVideoId
                    const savedState = localStorage.getItem('audiobook_state')
                    if (savedState) {
                      const state = JSON.parse(savedState)
                      // Verificar se é o mesmo vídeo e se foi salvo recentemente (última hora)
                      if (state.youtubeId === youtubeId &&
                        state.currentTime &&
                        (Date.now() - state.timestamp) < 3600000) {

                        console.log('Recuperando estado do localStorage (fallback):', state)
                        event.target.seekTo(state.currentTime)

                        if (state.isPlaying) {
                          // Pequeno delay para garantir que o seek funcionou
                          setTimeout(() => {
                            event.target.playVideo()
                          }, 1000)
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.log('Erro ao recuperar estado:', error)
                }
              },
              onStateChange: async (event: any) => {
                console.log('Estado do vídeo:', event.data)

                // Se o vídeo começou a tocar
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  setIsPlaying(true)
                  const currentMinutes = pauseMinutesRef.current
                  const timeInMs = currentMinutes * 60 * 1000
                  const timeInSeconds = currentMinutes * 60
                  setTimeRemaining(timeInSeconds)
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
                  setIsPlaying(false)
                  setTimeRemaining(0)
                  console.log('Vídeo pausado - limpando timer e salvando estado')
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                    timeoutRef.current = null
                  }
                  // Salvar estado quando o vídeo pausa (manualmente ou automaticamente)
                  await saveVideoState()
                }
              }
            }
          })
        }
      }

      // Se a API já estiver carregada
      if ((window as any).YT && (window as any).YT.Player) {
        ; (window as any).onYouTubeIframeAPIReady()
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
  }, [youtubeId]) // youtubeId como dependência para recriar quando mudar

  // useEffect para cronômetro regressivo
  useEffect(() => {
    let intervalId: number | null = null

    if (isPlaying && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isPlaying, timeRemaining])

  // Função para formatar tempo em mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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
          const timeInSeconds = value * 60

          // Atualizar cronômetro também
          setTimeRemaining(timeInSeconds)

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

  return (
    <main className="min-h-screen p-4 font-sans bg-gray-900">
      <div className="w-full p-6 mx-auto bg-gray-800 border border-gray-700 shadow-xl h-fit rounded-2xl">
        <h1 className="flex items-center justify-center gap-2 mb-6 text-2xl font-semibold text-center text-white">
          <span>🎧</span>
          <span>Audiobook Player</span>
        </h1>

        <div className="mb-6">
          <label htmlFor="video-input" className="flex items-center gap-2 mb-2 text-base font-medium text-gray-200">
            <span>📺</span>
            <span>URL ou ID do YouTube:</span>
          </label>
          <form onSubmit={handleVideoSubmit} className="space-y-3">
            <input
              id="video-input"
              type="text"
              value={videoInput}
              onChange={handleVideoChange}
              placeholder="Cole aqui: youtube.com/watch?v=..."
              className="w-full p-4 text-base text-white placeholder-gray-400 transition-colors bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 p-4 text-base font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800"
            >
              <span>🚀</span>
              <span>Carregar Vídeo</span>
            </button>
          </form>
          <p className="flex items-center gap-1 mt-2 text-sm text-gray-400">
            <span>💡</span>
            <span>Exemplo: https://youtube.com/watch?v=ABC123</span>
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="pause-minutes" className="flex items-center gap-2 mb-2 text-base font-medium text-gray-200">
            <span>⏰</span>
            <span>Pausar após (minutos):</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              id="pause-minutes"
              type="number"
              min="1"
              value={pauseMinutes}
              onChange={handleMinutesChange}
              className="w-16 lg:pl-4 pr-1 text-base text-center text-white transition-colors bg-gray-700 border-2 border-gray-600 rounded-lg h-15 focus:border-blue-500 focus:outline-none"
            />
            <span className="font-medium text-gray-300">minutos</span>
          </div>
        </div>

        {/* Botões de Biblioteca */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center justify-center flex-1 gap-2 p-3 text-sm font-medium text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <span>📚</span>
            <span>Minha Biblioteca ({savedVideos.length})</span>
          </button>
        </div>

        {/* Biblioteca de Vídeos */}
        {showLibrary && (
          <div className="mb-6 overflow-hidden border border-gray-600 bg-gray-800/80 rounded-xl">
            <div className="p-4 border-b border-gray-600 bg-gray-700/50">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <span>📚</span>
                <span>Minha Biblioteca</span>
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {getLibraryDescription()}
              </p>
            </div>

            {savedVideos.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                {savedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 transition-colors border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={`https://img.youtube.com/vi/${extractVideoId(video.url)}/mqdefault.jpg`}
                          alt={video.title}
                          className="object-cover w-16 h-12 bg-gray-700 rounded-lg"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="mb-1 text-sm font-medium leading-tight text-white truncate">
                          {video.title}
                        </h4>
                        <p className="mb-2 text-xs text-gray-400">
                          Adicionado {formatDate(video.createdAt)}
                          {video.lastPlayed && video.lastPlayed !== video.createdAt && (
                            <span> • Reproduzido {formatDate(video.lastPlayed)}</span>
                          )}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => loadVideo(video)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            <span>▶️</span>
                            <span>Carregar</span>
                          </button>

                          <button
                            onClick={() => removeVideo(video.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
                          >
                            <span>🗑️</span>
                            <span>Remover</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mb-3 text-4xl">📺</div>
                <p className="mb-2 text-gray-400">Sua biblioteca está vazia</p>
                <p className="text-sm text-gray-500">
                  Carregue um vídeo para adicioná-lo automaticamente aqui
                </p>
              </div>
            )}
          </div>
        )}

        {youtubeId ? (
          <div className="text-center">
            <div
              className="relative w-full max-w-2xl mx-auto pb-[56.25%] md:pb-[30%] h-0 overflow-hidden rounded-xl shadow-2xl mb-5 bg-gray-900 border border-gray-700"
            >
              <div
                id="youtube-player"
                className="absolute top-0 left-0 w-full h-full rounded-xl"
              ></div>
            </div>

            <div className="p-4 border border-gray-600 bg-gray-800/80 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center mb-3">
                <span className="mr-2 text-2xl">📱</span>
                <span className="text-sm font-semibold text-gray-200">
                  Otimizado para Mobile
                </span>
              </div>

              <div className="space-y-2 text-sm leading-relaxed text-center text-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-gray-200">🎵 Vídeo:</span>
                  <span className="px-2 py-1 font-mono text-xs text-gray-400 bg-gray-800 rounded">{youtubeId}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-gray-200">⏰ Auto-pausa:</span>
                  {isPlaying && timeRemaining > 0 ? (
                    <span className="font-medium text-red-400 font-mono">
                      {formatTime(timeRemaining)}
                    </span>
                  ) : (
                    <span className="font-medium text-blue-400">
                      {pauseMinutes} minuto{pauseMinutes > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="p-2 mt-3 text-xs italic text-blue-300 border rounded-lg bg-blue-900/20 border-blue-800/30">
                  <span className="mr-1">💡</span>
                  Continua tocando mesmo se fechar o app
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 my-5 text-center border-2 border-gray-600 border-dashed rounded-xl bg-gray-800/50">
            <div className="mb-4 text-5xl">🎧</div>
            <p className="text-base leading-relaxed text-gray-400">
              Cole uma URL do YouTube acima<br />
              <span className="text-gray-500">para começar a ouvir</span>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}