import { useState, useEffect, useRef } from 'react';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number; // em minutos
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

interface SpotifyPlayerState {
  track_window: {
    current_track: SpotifyTrack;
  };
  paused: boolean;
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  addListener: (event: string, callback: (data: SpotifyPlayerState) => void) => void;
}

interface SpotifyTrack {
  name: string;
  album: {
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
}

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume: number;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
  }
}

export function Pomodoro() {
  const [settings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Spotify State
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyPlayer, setSpotifyPlayer] = useState<SpotifyPlayer | null>(null);
  const [isSpotifyReady, setIsSpotifyReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Configurações do Spotify - ALTERE ESTAS VARIÁVEIS
  const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
  const REDIRECT_URI = window.location.origin + '/pomodoro';
  const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
  ];

  // Carregar Spotify Web Playback SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      setIsSpotifyReady(true);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Obter token do Spotify da URL após redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setSpotifyToken(token);
        window.location.hash = '';
        localStorage.setItem('spotify_token', token);
      }
    } else {
      const savedToken = localStorage.getItem('spotify_token');
      if (savedToken) {
        setSpotifyToken(savedToken);
      }
    }
  }, []);

  // Inicializar Spotify Player
  useEffect(() => {
    if (spotifyToken && isSpotifyReady && !spotifyPlayer) {
      const player = new window.Spotify.Player({
        name: 'Pomodoro Timer',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(spotifyToken);
        },
        volume: 0.7,
      });

      player.connect().then((success: boolean) => {
        if (success) {
          console.log('Conectado ao Spotify!');
        }
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Player pronto com Device ID:', device_id);
      });

      player.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        }
      });

      setSpotifyPlayer(player);

      return () => {
        player.disconnect();
      };
    }
  }, [spotifyToken, isSpotifyReady, spotifyPlayer]);

  // Login no Spotify
  const loginSpotify = () => {
    if (!SPOTIFY_CLIENT_ID) {
      alert('Configure o SPOTIFY_CLIENT_ID nas variáveis de ambiente!\n\nCrie um arquivo .env com:\nVITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui');
      return;
    }
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPES.join(' '))}`;
    window.location.href = authUrl;
  };

  // Controlar Spotify com Pomodoro
  const toggleSpotifyPlayback = async () => {
    if (spotifyPlayer) {
      try {
        await spotifyPlayer.togglePlay();
      } catch (error) {
        console.error('Erro ao controlar playback:', error);
      }
    }
  };

  // Timer do Pomodoro
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, handleSessionComplete]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    // Pausar Spotify ao completar sessão
    if (isPlaying) {
      toggleSpotifyPlayback();
    }

    if (sessionType === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setSessionType('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setSessionType('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);

    // Controlar Spotify junto com o timer
    if (spotifyPlayer) {
      toggleSpotifyPlayback();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workDuration * 60);
    setSessionType('work');
    setCompletedSessions(0);

    // Pausar Spotify ao resetar
    if (isPlaying && spotifyPlayer) {
      toggleSpotifyPlayback();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionLabel = (): string => {
    switch (sessionType) {
      case 'work':
        return 'Tempo de Foco';
      case 'shortBreak':
        return 'Pausa Curta';
      case 'longBreak':
        return 'Pausa Longa';
    }
  };

  const getSessionColor = (): string => {
    switch (sessionType) {
      case 'work':
        return 'bg-red-500';
      case 'shortBreak':
        return 'bg-green-500';
      case 'longBreak':
        return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Pomodoro + Spotify</h1>

        {/* Timer Principal */}
        <div className={`${getSessionColor()} rounded-3xl p-12 mb-8 shadow-2xl`}>
          <h2 className="text-2xl font-semibold text-center mb-6">{getSessionLabel()}</h2>
          <div className="text-8xl font-bold text-center mb-8">{formatTime(timeLeft)}</div>

          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition cursor-pointer"
            >
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={resetTimer}
              className="bg-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-600 transition cursor-pointer"
            >
              Resetar
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-lg">Sessões completadas: {completedSessions}</p>
          </div>
        </div>

        {/* Seção Spotify */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-green-500">♫</span> Spotify
            </h3>
            {!spotifyToken ? (
              <button
                onClick={loginSpotify}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full font-bold transition cursor-pointer"
              >
                Conectar Spotify
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Conectado</span>
              </div>
            )}
          </div>

          {currentTrack && (
            <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
              {currentTrack.album?.images[0] && (
                <img
                  src={currentTrack.album.images[0].url}
                  alt={currentTrack.name}
                  className="w-16 h-16 rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold">{currentTrack.name}</p>
                <p className="text-sm text-gray-400">
                  {currentTrack.artists.map((artist: { name: string }) => artist.name).join(', ')}
                </p>
              </div>
              <div className="text-2xl">
                {isPlaying ? '▶️' : '⏸️'}
              </div>
            </div>
          )}

          {!spotifyToken && (
            <div className="text-center text-gray-400 mt-4">
              <p>Conecte sua conta Spotify para sincronizar música com o Pomodoro</p>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6 text-sm text-gray-300">
          <h4 className="font-bold text-white mb-3">⚙️ Configuração (faça isso primeiro!):</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4 bg-gray-900 p-4 rounded">
            <li><strong className="text-white">Crie um app no Spotify:</strong>
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Acesse: <a href="https://developer.spotify.com/dashboard" target="_blank" className="text-blue-400 underline">developer.spotify.com/dashboard</a></li>
                <li>Clique em "Create app"</li>
                <li>Nome: "Pomodoro Timer" (ou qualquer nome)</li>
                <li>Descrição: qualquer texto</li>
                <li>Website: http://localhost:5173</li>
                <li><strong className="text-yellow-400">Redirect URI:</strong> <code className="bg-gray-800 px-2 py-1 rounded">{REDIRECT_URI}</code></li>
                <li>Marque "Web Playback SDK"</li>
              </ul>
            </li>
            <li><strong className="text-white">Copie o Client ID</strong> que aparecerá no dashboard</li>
            <li><strong className="text-white">Crie um arquivo <code className="bg-gray-800 px-2 py-1 rounded">.env</code></strong> na raiz do projeto com:
              <pre className="bg-gray-900 p-2 rounded mt-1 text-green-400">VITE_SPOTIFY_CLIENT_ID=cole_seu_client_id_aqui</pre>
            </li>
            <li><strong className="text-white">Reinicie o servidor</strong> de desenvolvimento</li>
          </ol>

          <h4 className="font-bold text-white mb-3 mt-6">🎵 Como usar:</h4>
          <ul className="list-disc list-inside space-y-2">
            <li>Conecte sua conta Spotify clicando no botão acima</li>
            <li>Inicie uma música no Spotify (app ou web player)</li>
            <li>Ao clicar em "Iniciar" no Pomodoro, a música tocará automaticamente</li>
            <li>Ao pausar ou completar uma sessão, a música pausará junto</li>
            <li>Trabalhe 25min, descanse 5min (pausa longa de 15min a cada 4 sessões)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
