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

interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

const API_BASE_URL = 'https://api.dizelequefez.com.br'

// Função auxiliar para extrair YouTube ID da URL
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
  const [videoTitle, setVideoTitle] = useState<string>('')
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [showLibrary, setShowLibrary] = useState<boolean>(false)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState<boolean>(false)
  const playerRef = useRef<any>(null)
  const timeoutRef = useRef<number | null>(null)
  const pauseMinutesRef = useRef<number>(1)
  const [pauseMinutes, setPauseMinutes] = useState<number>(1)

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
      console.log('Novo YouTube ID:', newYoutubeId)

      // Auto-salvar vídeo na API quando carregado
      // Aguardar o título ser capturado pelo onReady do player
      setTimeout(async () => {
        if (videoTitle) {
          try {
            // Verificar se já existe na biblioteca
            const existingVideo = savedVideos.find(v => v.url === videoInput.trim())
            if (existingVideo) {
              setCurrentVideoId(existingVideo.id)
              console.log('Vídeo já existe na biblioteca, usando ID:', existingVideo.id)
            } else {
              // Criar novo vídeo na API
              const newVideo = await saveVideoToAPI({
                title: videoTitle,
                url: videoInput.trim(),
                currentTime: 0,
                pauseMinutes: pauseMinutes,
                lastPlayed: new Date().toISOString()
              })

              if (newVideo) {
                setCurrentVideoId(newVideo.id)
                setSavedVideos(prev => [newVideo, ...prev])
                console.log('Novo vídeo auto-salvo na API:', newVideo.title, 'ID:', newVideo.id)
              }
            }
          } catch (error) {
            console.error('Erro ao auto-salvar vídeo:', error)
          }
        }
      }, 3000) // Aguardar 3 segundos para o título ser capturado
    }
  }

  const saveCurrentVideo = async () => {
    if (youtubeId && videoTitle) {
      try {
        const newVideo = await saveVideoToAPI({
          title: videoTitle,
          url: videoInput || `https://youtube.com/watch?v=${youtubeId}`,
          currentTime: 0,
          pauseMinutes: pauseMinutes,
          lastPlayed: new Date().toISOString()
        })

        if (newVideo) {
          setSavedVideos(prev => {
            const filtered = prev.filter(v => v.url !== newVideo.url)
            const newList = [newVideo, ...filtered]
            console.log('Vídeo salvo na biblioteca:', newVideo.title)
            return newList
          })

          // Feedback visual temporário
          const button = document.querySelector('[data-save-button]') as HTMLButtonElement
          if (button) {
            const originalText = button.innerHTML
            button.innerHTML = '<span>✅</span><span>Salvo!</span>'
            button.disabled = true
            setTimeout(() => {
              button.innerHTML = originalText
              button.disabled = false
            }, 2000)
          }
        }
      } catch (error) {
        console.error('Erro ao salvar vídeo:', error)
      }
    }
  }

  const loadVideo = (savedVideo: SavedVideo) => {
    console.log('Carregando vídeo da biblioteca:', savedVideo.title)
    const youtubeIdFromUrl = extractVideoId(savedVideo.url)
    setYoutubeId(youtubeIdFromUrl)
    setCurrentVideoId(savedVideo.id)
    setVideoInput(savedVideo.url)
    setVideoTitle(savedVideo.title)
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
          const containerWidth = container?.parentElement?.offsetWidth || 320
          const containerHeight = Math.round(containerWidth * 0.5625) // 16:9 ratio

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
              onReady: (event: any) => {
                console.log('Player ready')

                // Capturar título do vídeo
                try {
                  const title = event.target.getVideoData().title
                  setVideoTitle(title || youtubeId)
                } catch (error) {
                  console.log('Erro ao capturar título:', error)
                  setVideoTitle(youtubeId)
                }

                // Recuperar estado salvo se existir
                try {
                  const savedState = localStorage.getItem('audiobook_state')
                  if (savedState) {
                    const state = JSON.parse(savedState)
                    // Verificar se é o mesmo vídeo e se foi salvo recentemente (última hora)
                    if (state.youtubeId === youtubeId &&
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
              onStateChange: async (event: any) => {
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

  return (
    <main className="min-h-screen bg-gray-900 p-4 font-sans">
      <div className="mx-auto h-fit w-full  bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
        <h1 className="text-center text-2xl font-semibold text-white mb-6 flex items-center justify-center gap-2">
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
              className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 text-base focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-base font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>Carregar Vídeo</span>
            </button>
          </form>
          <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
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
              className="w-16 h-15 pl-4 pr-1 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-base text-center focus:border-blue-500 focus:outline-none transition-colors"
            />
            <span className="text-gray-300 font-medium">minutos</span>
          </div>
        </div>

        {/* Botões de Biblioteca */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>📚</span>
            <span>Minha Biblioteca ({savedVideos.length})</span>
          </button>

          {youtubeId && videoTitle && (
            <button
              onClick={saveCurrentVideo}
              data-save-button
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>⭐</span>
              <span>Salvar</span>
            </button>
          )}
        </div>

        {/* Biblioteca de Vídeos */}
        {showLibrary && (
          <div className="mb-6 bg-gray-800/80 rounded-xl border border-gray-600 overflow-hidden">
            <div className="p-4 bg-gray-700/50 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📚</span>
                <span>Minha Biblioteca</span>
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {getLibraryDescription()}
              </p>
            </div>

            {savedVideos.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {savedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded-lg bg-gray-700"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm leading-tight mb-1 truncate">
                          {video.title}
                        </h4>
                        <p className="text-gray-400 text-xs mb-2">
                          Adicionado {formatDate(video.createdAt)}
                          {video.lastPlayed && video.lastPlayed !== video.createdAt && (
                            <span> • Reproduzido {formatDate(video.lastPlayed)}</span>
                          )}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => loadVideo(video)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                          >
                            <span>▶️</span>
                            <span>Carregar</span>
                          </button>

                          <button
                            onClick={() => removeVideo(video.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors flex items-center gap-1"
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
                <div className="text-4xl mb-3">📺</div>
                <p className="text-gray-400 mb-2">Sua biblioteca está vazia</p>
                <p className="text-gray-500 text-sm">
                  Carregue um vídeo e clique em "Salvar" para adicioná-lo aqui
                </p>
              </div>
            )}
          </div>
        )}

        {youtubeId ? (
          <div className="text-center">
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl mb-5 bg-gray-900 border border-gray-700">
              <div
                id="youtube-player"
                className="absolute top-0 left-0 w-full h-full rounded-xl"
              ></div>
            </div>

            <div className="p-4 bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-3">
                <span className="text-2xl mr-2">📱</span>
                <span className="text-sm font-semibold text-gray-200">
                  Otimizado para Mobile
                </span>
              </div>

              <div className="text-sm text-gray-300 leading-relaxed text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-gray-200">🎵 Vídeo:</span>
                  <span className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">{youtubeId}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-gray-200">⏰ Auto-pausa:</span>
                  <span className="text-blue-400 font-medium">{pauseMinutes} minuto{pauseMinutes > 1 ? 's' : ''}</span>
                </div>
                <div className="text-xs text-blue-300 italic mt-3 p-2 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  <span className="mr-1">💡</span>
                  Continua tocando mesmo se fechar o app
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50 my-5">
            <div className="text-5xl mb-4">🎧</div>
            <p className="text-gray-400 text-base leading-relaxed">
              Cole uma URL do YouTube acima<br />
              <span className="text-gray-500">para começar a ouvir</span>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}