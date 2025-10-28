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

export function Shooter() {
  // Direção da bala: 'up', 'down', 'left', 'right'
  const [bulletDirection, setBulletDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Position>({ x: 400, y: 500 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
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
      if (e.key === ' ') {
        e.preventDefault();
        setPlayer((currentPlayer) => {
          const bullet: Bullet & { direction: 'up' | 'down' | 'left' | 'right' } = {
            id: bulletIdCounter.current++,
            x: currentPlayer.x + PLAYER_SIZE / 2 - BULLET_WIDTH / 2,
            y: currentPlayer.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            direction: bulletDirection,
          };
          setBullets((prev) => [...prev, bullet]);
          return currentPlayer;
        });
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Definir direção da bala
        if (e.key === 'ArrowUp') setBulletDirection('up');
        if (e.key === 'ArrowDown') setBulletDirection('down');
        if (e.key === 'ArrowLeft') setBulletDirection('left');
        if (e.key === 'ArrowRight') setBulletDirection('right');
        e.preventDefault();
        keysPressed.current.add(e.key);
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

  // Renderizar o jogo no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Desenhar jogador
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

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
  }, [player, bullets, obstacles]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f1e] p-5">
      <h1 className="text-white mb-5 text-2xl font-bold">Game</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-green-400 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
      />
    </div>
  );
}