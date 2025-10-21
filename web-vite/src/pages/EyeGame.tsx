import { useEffect, useRef, useState } from 'react';

interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
}

export function EyeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Posição do mouse
  const mousePos = useRef({ x: 400, y: 300 });
  
  // Projéteis
  const projectiles = useRef<Projectile[]>([]);
  
  // Timers e configurações
  const lastShot = useRef(0);
  const gameStartTime = useRef(Date.now());
  
  // Configurações do olho
  const eyeCenter = { x: 400, y: 300 };
  const eyeRadius = 80;
  const pupilRadius = 25;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redimensionar canvas
    canvas.width = 800;
    canvas.height = 600;

    let animationId: number;

    // Função para calcular posição da pupila
    const calculatePupilPosition = () => {
      const dx = mousePos.current.x - eyeCenter.x;
      const dy = mousePos.current.y - eyeCenter.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance <= eyeRadius - pupilRadius) {
        return { x: mousePos.current.x, y: mousePos.current.y };
      }
      
      const angle = Math.atan2(dy, dx);
      const maxDistance = eyeRadius - pupilRadius;
      return {
        x: eyeCenter.x + Math.cos(angle) * maxDistance,
        y: eyeCenter.y + Math.sin(angle) * maxDistance
      };
    };

    // Função para criar projétil
    const createProjectile = () => {
      const pupilPos = calculatePupilPosition();
      const dx = mousePos.current.x - pupilPos.x;
      const dy = mousePos.current.y - pupilPos.y;
      const distance = Math.hypot(dx, dy);
      
      const speed = 3 + Math.floor((Date.now() - gameStartTime.current) / 10000); // Aumenta velocidade com tempo
      
      projectiles.current.push({
        x: pupilPos.x,
        y: pupilPos.y,
        dx: (dx / distance) * speed,
        dy: (dy / distance) * speed,
        speed
      });
    };

    // Função para verificar colisão com cursor
    const checkCursorCollision = (projectile: Projectile) => {
      const dx = projectile.x - mousePos.current.x;
      const dy = projectile.y - mousePos.current.y;
      const distance = Math.hypot(dx, dy);
      return distance < 15; // Raio do cursor
    };

    // Função para lidar com colisão de projétil
    const handleProjectileCollision = () => {
      setHp(prevHp => {
        const newHp = prevHp - 10;
        if (newHp <= 0) {
          setGameOver(true);
        }
        return Math.max(0, newHp);
      });
    };

    // Função de renderização
    const render = () => {
      if (gameOver) return;

      // Limpar canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar olho (esclera)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeCenter.x, eyeCenter.y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar íris
      const pupilPos = calculatePupilPosition();
      ctx.fillStyle = '#4169e1';
      ctx.beginPath();
      ctx.arc(pupilPos.x, pupilPos.y, pupilRadius + 10, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar pupila
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pupilPos.x, pupilPos.y, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar reflexo no olho
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pupilPos.x - 8, pupilPos.y - 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar cursor do jogador
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(mousePos.current.x, mousePos.current.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mousePos.current.x, mousePos.current.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Atualizar e desenhar projéteis
      projectiles.current = projectiles.current.filter(projectile => {
        // Atualizar posição
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;

        // Verificar se ainda está na tela
        if (projectile.x < 0 || projectile.x > canvas.width || 
            projectile.y < 0 || projectile.y > canvas.height) {
          return false;
        }

        // Verificar colisão com cursor
        if (checkCursorCollision(projectile)) {
          handleProjectileCollision();
          return false; // Remove o projétil
        }

        // Desenhar projétil
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Adicionar brilho ao projétil
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(projectile.x - 2, projectile.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Criar novos projéteis
      const currentTime = Date.now();
      const timeSinceStart = currentTime - gameStartTime.current;
      const shootInterval = Math.max(500, 2000 - Math.floor(timeSinceStart / 5000) * 200); // Aumenta frequência com tempo

      if (currentTime - lastShot.current > shootInterval) {
        createProjectile();
        lastShot.current = currentTime;
        setScore(prev => prev + 1);
      }

      animationId = requestAnimationFrame(render);
    };

    // Event listener para movimento do mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Iniciar o jogo
    gameStartTime.current = Date.now();
    lastShot.current = Date.now();
    render();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver]);

  // Função para reiniciar o jogo
  const restartGame = () => {
    setHp(100);
    setGameOver(false);
    setScore(0);
    projectiles.current = [];
    gameStartTime.current = Date.now();
    lastShot.current = Date.now();
  };

  // Função para definir cor do HP
  const getHpColor = (hp: number) => {
    if (hp > 30) return '#00ff00';
    if (hp > 10) return '#ffff00';
    return '#ff0000';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      backgroundColor: '#111', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Interface do jogo */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '800px', 
        marginBottom: '10px',
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        <div style={{ color: getHpColor(hp) }}>
          ❤️ HP: {hp}
        </div>
        <div style={{ color: '#00bfff' }}>
          🎯 Tiros Sobrevividos: {score}
        </div>
      </div>

      {/* Canvas do jogo */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ 
            border: '2px solid #333',
            cursor: 'none',
            backgroundColor: '#000'
          }}
        />
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '30px',
            borderRadius: '10px',
            border: '2px solid #ff0000'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💀</div>
            <div style={{ fontSize: '32px', marginBottom: '10px', color: '#ff0000' }}>
              Game Over
            </div>
            <div style={{ fontSize: '18px', marginBottom: '20px' }}>
              Você sobreviveu a {score} tiros!
            </div>
            <button
              onClick={restartGame}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Jogar Novamente
            </button>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div style={{ 
        marginTop: '20px', 
        color: '#ccc', 
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: '1.5'
      }}>
        <p><strong>🎮 Como Jogar:</strong></p>
        <p>• Mova o mouse para controlar seu cursor (ponto verde)</p>
        <p>• Desvie dos projéteis vermelhos que saem do olho</p>
        <p>• A cada tiro que você leva, perde 10 HP</p>
        <p>• O jogo fica mais difícil com o tempo!</p>
      </div>
    </div>
  );
}