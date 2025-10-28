import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const WS_URL = 'ws://localhost:3000/games/ws';

export function Shooter() {
  const { token } = useAuth();
  // Direção da bala: 'up', 'down', 'left', 'right'
  const [bulletDirection, setBulletDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Position>({ x: 400, y: 500 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [opponent, setOpponent] = useState<Position | null>(null);
  const [players, setPlayers] = useState<Array<{ id: string; positionX: number; positionY: number }>>([]);
  const ws = useRef<WebSocket | null>(null);
  // Centralizar blocos com gap de 50px em todas as direções
  const blockWidth = 80;
  const blockHeight = 80;
  const gap = 50;
  // Grade 2x2 principal
  const gridCols = 2;
  const gridRows = 2;
  const gridWidth = blockWidth * gridCols + gap * (gridCols - 1);
  const gridHeight = blockHeight * gridRows + gap * (gridRows - 1);
  const startX = (800 - (gridWidth + 2 * (blockWidth + gap))) / 2; // inclui laterais
  const startY = (950 - gridHeight) / 2;
  const [obstacles] = useState<Obstacle[]>([
    // Grade 2x2 centralizada
    { id: 1, x: startX + (blockWidth + gap), y: startY, width: blockWidth, height: blockHeight },
    { id: 2, x: startX + (blockWidth + gap) * 2, y: startY, width: blockWidth, height: blockHeight },
    { id: 3, x: startX + (blockWidth + gap), y: startY + blockHeight + gap, width: blockWidth, height: blockHeight },
    { id: 4, x: startX + (blockWidth + gap) * 2, y: startY + blockHeight + gap, width: blockWidth, height: blockHeight },
    // Laterais
    { id: 5, x: startX, y: startY, width: blockWidth, height: blockHeight },
    { id: 6, x: startX + (blockWidth + gap) * 3, y: startY, width: blockWidth, height: blockHeight },
    { id: 7, x: startX, y: startY + blockHeight + gap, width: blockWidth, height: blockHeight },
    { id: 8, x: startX + (blockWidth + gap) * 3, y: startY + blockHeight + gap, width: blockWidth, height: blockHeight },
  ]);
  const keysPressed = useRef<Set<string>>(new Set());
  const bulletIdCounter = useRef(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 950;
  const PLAYER_SIZE = 20;
  const PLAYER_SPEED = 5; // Move 5 pixels por vez
  const BULLET_SPEED = 15;
  const BULLET_WIDTH = 5;
  const BULLET_HEIGHT = 15;

  // Controle do teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([
        ' ',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
      ].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
        // Atualiza direção da bala
        if (e.key === 'ArrowUp') setBulletDirection('up');
        if (e.key === 'ArrowDown') setBulletDirection('down');
        if (e.key === 'ArrowLeft') setBulletDirection('left');
        if (e.key === 'ArrowRight') setBulletDirection('right');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    globalThis.addEventListener('keyup', handleKeyUp);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      globalThis.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Ref para posição do player sempre atualizada
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Tiro automático ao segurar espaço (sempre para frente, independente do movimento)
  useEffect(() => {
    let shootInterval: any = null;
    shootInterval = setInterval(() => {
      if (keysPressed.current.has(' ')) {
        setBullets((prev) => [
          ...prev,
          {
            id: bulletIdCounter.current++,
            x: playerRef.current.x + PLAYER_SIZE / 2 - BULLET_WIDTH / 2,
            y: playerRef.current.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            direction: 'up',
          }
        ]);
      }
    }, 200); // 1 tiro a cada 200ms se espaço estiver pressionado
    return () => {
      if (shootInterval) clearInterval(shootInterval);
    };
  }, []);

  // Disparar tiro imediatamente ao pressionar espaço
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        // Dispara um tiro imediatamente ao pressionar espaço
        setBullets((prev) => [
          ...prev,
          {
            id: bulletIdCounter.current++,
            x: playerRef.current.x + PLAYER_SIZE / 2 - BULLET_WIDTH / 2,
            y: playerRef.current.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            direction: 'up',
          }
        ]);
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Movimento do jogador
  useEffect(() => {
    const movePlayer = () => {
      setPlayer((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current.has('ArrowLeft')) {
          newX = Math.max(0, prev.x - PLAYER_SPEED);
        }
        if (keysPressed.current.has('ArrowRight')) {
          newX = Math.min(CANVAS_WIDTH - PLAYER_SIZE, prev.x + PLAYER_SPEED);
        }
        if (keysPressed.current.has('ArrowUp')) {
          newY = Math.max(0, prev.y - PLAYER_SPEED);
        }
        if (keysPressed.current.has('ArrowDown')) {
          newY = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, prev.y + PLAYER_SPEED);
        }

        const wouldCollide = obstacles.some((obstacle) => {
          return (
            newX < obstacle.x + obstacle.width &&
            newX + PLAYER_SIZE > obstacle.x &&
            newY < obstacle.y + obstacle.height &&
            newY + PLAYER_SIZE > obstacle.y
          );
        });

        if (wouldCollide) {
          return prev;
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(movePlayer, 1000 / 60);
    return () => clearInterval(interval);
  }, [obstacles]);

  // Mover balas e remover as que saem da tela ou colidem com obstáculos
  useEffect(() => {
    const moveBullets = () => {
      setBullets((prevBullets) => {
        const movedBullets = prevBullets.map((bullet) => {
          const b = bullet as Bullet & { direction: 'up' | 'down' | 'left' | 'right' };
          let dx = 0, dy = 0;
          switch (b.direction) {
            case 'up': dy = -BULLET_SPEED; break;
            case 'down': dy = BULLET_SPEED; break;
            case 'left': dx = -BULLET_SPEED; break;
            case 'right': dx = BULLET_SPEED; break;
            default: dy = -BULLET_SPEED;
          }
          return {
            ...b,
            x: b.x + dx,
            y: b.y + dy,
          };
        });
        // Filtrar balas que saem da tela ou colidem com obstáculos
        const remainingBullets = movedBullets.filter((bullet) => {
          const b = bullet as Bullet & { direction: 'up' | 'down' | 'left' | 'right' };
          if (
            b.x <= -BULLET_WIDTH || b.x >= CANVAS_WIDTH ||
            b.y <= -BULLET_HEIGHT || b.y >= CANVAS_HEIGHT
          ) return false;
          const hitIndex = obstacles.findIndex((obstacle) => (
            b.x < obstacle.x + obstacle.width &&
            b.x + b.width > obstacle.x &&
            b.y < obstacle.y + obstacle.height &&
            b.y + b.height > obstacle.y
          ));
          if (hitIndex !== -1) {
            return false; // remove a bala, mas não o bloco
          }
          return true;
        });
        return remainingBullets;
      });
    };

    const interval = setInterval(moveBullets, 1000 / 60);
    return () => clearInterval(interval);
  }, [obstacles, bulletDirection]);

  // Estado para armazenar o id do próprio jogador
  const [myId, setMyId] = useState<string | null>(null);

  // WebSocket: conectar e autenticar, depois enviar coordenadas
  useEffect(() => {
    if (!token) return;
    ws.current = new globalThis.WebSocket(WS_URL + `?token=${token}`);
    ws.current.onopen = () => {
      // Armazena o id do socket (usando a propriedade 'ws.id' enviada pelo backend)
      // O backend deve enviar um evento { event: 'myId', message: { id: ws.id } } logo após conectar
      // Se não enviar, pode-se usar o id retornado no primeiro playersList (caso só haja 1 jogador)
    };
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 Mensagem recebida do backend:', data);
        if (data.event === 'myId') {
          setMyId(data.message.id);
        }
        if (data.event === 'playersList') {
          setPlayers(data.message.players);
          // Se ainda não temos o myId, e só há 1 jogador, assuma que é o próprio
          if (!myId && data.message.players.length === 1) {
            setMyId(data.message.players[0].id);
          }
        }
        if (data.event === 'opponentCoords') {
          setOpponent({ x: data.message.positionX, y: data.message.positionY });
        }
      } catch (e) {
        console.log('Erro ao parsear mensagem do WebSocket:', e);
      }
    };
    ws.current.onclose = () => {
      // Opcional: console.log('❌ Conexão fechada');
    };
    ws.current.onerror = (err) => {
      // Opcional: console.error('⚠️ Erro:', err);
    };
    return () => {
      ws.current?.close();
    };
  }, [token, player.x, player.y, myId]);

  // Enviar coordenadas ao mover
  useEffect(() => {
    if (!ws.current || ws.current.readyState !== 1) return;
    ws.current.send(
      JSON.stringify({ positionX: player.x, positionY: player.y })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.x, player.y]);

  // Renderizar o jogo no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Desenhar todos os jogadores conectados (verde para o próprio, verde claro para os outros)
    for (const p of players) {
      ctx.fillStyle = '#90ee90'; // verde claro padrão
      ctx.fillRect(p.positionX, p.positionY, PLAYER_SIZE, PLAYER_SIZE);
    }
    // Desenhar o próprio jogador por cima, em verde
    const me = myId ? players.find(p => p.id === myId) : null;
    if (me) {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(me.positionX, me.positionY, PLAYER_SIZE, PLAYER_SIZE);
    }

    // Desenhar obstáculos
    ctx.fillStyle = '#ff0000';
    for (const obstacle of obstacles) {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Desenhar balas
    ctx.fillStyle = '#ffff00';
    for (const bullet of bullets) {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }, [players, bullets, obstacles, myId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f1e] p-5">
      <h1 className="text-white mb-5 text-2xl font-bold">Game</h1>
      <ul className="mb-4 text-white">
        {players.map((p) => (
          <li key={p.id}>
            Jogador {p.id}: ({p.positionX}, {p.positionY})
          </li>
        ))}
      </ul>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-green-400 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
      />
    </div>
  );
}