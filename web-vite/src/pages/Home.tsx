import { useEffect, useRef, useState } from 'react';

interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  size: number;
  color: string;
}

export function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Posição do mouse
  const mousePos = useRef({ x: 400, y: 300 });
  const lastMousePos = useRef({ x: 400, y: 300 });
  const lastMouseMoveTime = useRef(Date.now());
  const isMouseStatic = useRef(false);
  const cursorShakeIntensity = useRef(0);
  
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
      
      // Se o mouse está muito próximo do centro, use uma posição ligeiramente deslocada
      if (distance < 10) {
        return { 
          x: eyeCenter.x + 10, 
          y: eyeCenter.y 
        };
      }
      
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

    // Função para criar projétil com desafios progressivos
    const createProjectile = () => {
      const pupilPos = calculatePupilPosition();
      const currentTime = Date.now();
      const timeSinceStart = currentTime - gameStartTime.current;
      const difficultyLevel = Math.floor(timeSinceStart / 15000);
      
      // Verificar se o mouse está parado por mais de 2 segundos
      const timeSinceLastMove = currentTime - lastMouseMoveTime.current;
      const mouseIsStatic = timeSinceLastMove > 2000;
      
      // Tipos de projéteis baseados na dificuldade
      const projectileTypes = [
        { size: 6, color: '#ff0000', damage: 10 }, // Normal - vermelho
        { size: 8, color: '#ff4500', damage: 15 }, // Médio - laranja
        { size: 10, color: '#8b0000', damage: 20 }, // Grande - vermelho escuro
        { size: 4, color: '#ff69b4', damage: 5 }   // Rápido - rosa
      ];
      
      let projectileType = projectileTypes[0]; // Padrão
      
      if (difficultyLevel >= 3) {
        projectileType = projectileTypes[Math.floor(Math.random() * projectileTypes.length)];
      } else if (difficultyLevel >= 2) {
        projectileType = projectileTypes[Math.floor(Math.random() * 2)];
      }
      
      const baseSpeed = 3 + difficultyLevel * 0.5;
      const speed = baseSpeed + Math.random() * 2;
      
      // Sistema de tiros múltiplos e aleatórios
      let projectilesToCreate: Array<{x: number, y: number, dx: number, dy: number, speed: number, size: number, color: string}> = [];
      
      // 1. Tiro direcionado ao mouse (sempre)
      const dx = mousePos.current.x - pupilPos.x;
      const dy = mousePos.current.y - pupilPos.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance > 1) {
        const targetSpeed = mouseIsStatic ? speed * 1.5 : speed;
        projectilesToCreate.push({
          x: pupilPos.x,
          y: pupilPos.y,
          dx: (dx / distance) * targetSpeed,
          dy: (dy / distance) * targetSpeed,
          speed: targetSpeed,
          size: projectileType.size,
          color: projectileType.color
        });
      }
      
      // 2. Tiros aleatórios baseados na dificuldade
      const randomShotsCount = Math.min(difficultyLevel, 4); // Máximo 4 tiros aleatórios
      
      for (let i = 0; i < randomShotsCount; i++) {
        const randomAngle = Math.random() * Math.PI * 2;
        const randomSpeed = speed * (0.8 + Math.random() * 0.4); // Velocidade variada
        
        // Projétis aleatórios são menores mas mais rápidos
        const randomProjectileType = {
          size: 4 + Math.random() * 4, // Tamanho entre 4-8
          color: ['#ff0000', '#ff4500', '#ff69b4'][Math.floor(Math.random() * 3)],
          damage: 8
        };
        
        projectilesToCreate.push({
          x: pupilPos.x,
          y: pupilPos.y,
          dx: Math.cos(randomAngle) * randomSpeed,
          dy: Math.sin(randomAngle) * randomSpeed,
          speed: randomSpeed,
          size: randomProjectileType.size,
          color: randomProjectileType.color
        });
      }
      
      // 3. Se o mouse está parado, adicionar padrão de tiros em spray
      if (mouseIsStatic) {
        const sprayCount = 6; // 6 tiros em padrão circular
        for (let i = 0; i < sprayCount; i++) {
          const angle = (i / sprayCount) * Math.PI * 2;
          const spraySpeed = speed * 1.2;
          
          projectilesToCreate.push({
            x: pupilPos.x,
            y: pupilPos.y,
            dx: Math.cos(angle) * spraySpeed,
            dy: Math.sin(angle) * spraySpeed,
            speed: spraySpeed,
            size: 5,
            color: '#ff0000'
          });
        }
      }
      
      // 4. Adicionar projéteis múltiplos em níveis avançados
      if (difficultyLevel >= 4 && Math.random() < 0.3) {
        const multiCount = 3;
        for (let i = 0; i < multiCount; i++) {
          const spreadAngle = (i - 1) * (Math.PI / 8); // Spread de 22.5 graus
          const baseAngle = Math.atan2(dy, dx) + spreadAngle;
          
          projectilesToCreate.push({
            x: pupilPos.x,
            y: pupilPos.y,
            dx: Math.cos(baseAngle) * speed,
            dy: Math.sin(baseAngle) * speed,
            speed,
            size: projectileType.size,
            color: projectileType.color
          });
        }
      }
      
      // Adicionar todos os projéteis criados
      projectiles.current.push(...projectilesToCreate);
    };

    // Função para verificar colisão com cursor
    const checkCursorCollision = (projectile: Projectile) => {
      const dx = projectile.x - mousePos.current.x;
      const dy = projectile.y - mousePos.current.y;
      const distance = Math.hypot(dx, dy);
      return distance < (15 + projectile.size / 2); // Colisão baseada no tamanho do projétil
    };

    // Função para calcular dano baseado no tamanho do projétil
    const calculateDamage = (size: number) => {
      if (size >= 10) return 20;
      if (size >= 8) return 15;
      if (size >= 6) return 10;
      return 5;
    };

    // Função para lidar com colisão de projétil
    const handleProjectileCollision = (projectile: Projectile) => {
      const damage = calculateDamage(projectile.size);
      
      setHp(prevHp => {
        const newHp = prevHp - damage;
        if (newHp <= 0) {
          setGameOver(true);
        }
        return Math.max(0, newHp);
      });
      
      // Fazer o cursor tremer quando tomar dano
      cursorShakeIntensity.current = damage * 2; // Tremor proporcional ao dano
    };

    // Função de renderização
    const render = () => {
      if (gameOver) return;

      // Limpar canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calcular shake do olho (apenas natural, não por dano)
      const currentTime = Date.now();
      const timeSinceStart = currentTime - gameStartTime.current;
      const difficultyLevel = Math.floor(timeSinceStart / 15000);
      
      // Shake natural do olho diabólico (sem tremor por dano)
      const naturalShake = Math.sin(currentTime / 200) * (1 + difficultyLevel * 0.5);
      
      const shakeX = naturalShake;
      const shakeY = naturalShake;
      
      const currentEyeCenter = {
        x: eyeCenter.x + shakeX,
        y: eyeCenter.y + shakeY
      };

      // Desenhar aura diabólica baseada na dificuldade
      if (difficultyLevel > 0) {
        const auraIntensity = Math.min(difficultyLevel * 0.3, 1);
        const gradient = ctx.createRadialGradient(
          currentEyeCenter.x, currentEyeCenter.y, eyeRadius,
          currentEyeCenter.x, currentEyeCenter.y, eyeRadius + 50
        );
        gradient.addColorStop(0, `rgba(139, 0, 0, ${auraIntensity})`);
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentEyeCenter.x, currentEyeCenter.y, eyeRadius + 50, 0, Math.PI * 2);
        ctx.fill();
      }

      // Desenhar olho (esclera) com cor mais sinistra
      const scleraColor = difficultyLevel >= 2 ? '#f0f0f0' : '#ffffff';
      ctx.fillStyle = scleraColor;
      ctx.beginPath();
      ctx.arc(currentEyeCenter.x, currentEyeCenter.y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Adicionar veias vermelhas em níveis avançados
      if (difficultyLevel >= 1) {
        ctx.strokeStyle = `rgba(139, 0, 0, ${Math.min(difficultyLevel * 0.3, 0.8)})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const startX = currentEyeCenter.x + Math.cos(angle) * (eyeRadius - 20);
          const startY = currentEyeCenter.y + Math.sin(angle) * (eyeRadius - 20);
          const endX = currentEyeCenter.x + Math.cos(angle) * eyeRadius;
          const endY = currentEyeCenter.y + Math.sin(angle) * eyeRadius;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      // Desenhar íris diabólica
      const pupilPos = calculatePupilPosition();
      const adjustedPupilPos = {
        x: pupilPos.x + shakeX,
        y: pupilPos.y + shakeY
      };
      
      const irisColor = difficultyLevel >= 3 ? '#8b0000' : '#4169e1';
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.arc(adjustedPupilPos.x, adjustedPupilPos.y, pupilRadius + 10, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar pupila com efeito pulsante
      const pulseSize = pupilRadius + Math.sin(currentTime / 300) * 3;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(adjustedPupilPos.x, adjustedPupilPos.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar reflexo diabólico
      ctx.fillStyle = difficultyLevel >= 2 ? '#ff4444' : '#ffffff';
      ctx.beginPath();
      ctx.arc(adjustedPupilPos.x - 8, adjustedPupilPos.y - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar cursor do jogador com tremor quando tomar dano
      const timeSinceLastMove = currentTime - lastMouseMoveTime.current;
      const cursorInDanger = timeSinceLastMove > 1500; // Aviso 0.5s antes da mira perfeita
      
      // Calcular posição do cursor com tremor
      cursorShakeIntensity.current = Math.max(0, cursorShakeIntensity.current - 1);
      const cursorShakeX = (Math.random() - 0.5) * cursorShakeIntensity.current;
      const cursorShakeY = (Math.random() - 0.5) * cursorShakeIntensity.current;
      
      const finalCursorX = mousePos.current.x + cursorShakeX;
      const finalCursorY = mousePos.current.y + cursorShakeY;
      
      if (cursorInDanger) {
        // Efeito pulsante de aviso
        const pulseIntensity = Math.sin(currentTime / 100) * 0.5 + 0.5;
        const warningColor = timeSinceLastMove > 2000 ? 
          `rgba(255, 0, 0, ${0.7 + pulseIntensity * 0.3})` : 
          `rgba(255, 255, 0, ${0.5 + pulseIntensity * 0.5})`;
        
        // Círculo de aviso maior
        ctx.fillStyle = warningColor;
        ctx.beginPath();
        ctx.arc(finalCursorX, finalCursorY, 15 + pulseIntensity * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Cursor principal
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(finalCursorX, finalCursorY, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(finalCursorX, finalCursorY, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      // Efeito visual adicional quando está tremendo (tomou dano)
      if (cursorShakeIntensity.current > 5) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(finalCursorX, finalCursorY, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

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
          handleProjectileCollision(projectile);
          return false; // Remove o projétil
        }

        // Desenhar projétil com base no tipo
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();

        // Adicionar brilho ao projétil
        ctx.fillStyle = getGlowColor(projectile.color);
        ctx.beginPath();
        ctx.arc(projectile.x - 2, projectile.y - 2, projectile.size / 2, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Criar novos projéteis
      const now = Date.now();
      const elapsed = now - gameStartTime.current;
      const diffLevel = Math.floor(elapsed / 15000);
      
      // Frequência de tiros ajustada para compensar tiros múltiplos
      let baseInterval = 1500; // Intervalo base maior
      if (diffLevel >= 1) baseInterval = 1200;
      if (diffLevel >= 2) baseInterval = 1000;
      if (diffLevel >= 3) baseInterval = 800;
      if (diffLevel >= 4) baseInterval = 600;
      
      const shootInterval = baseInterval;

      if (now - lastShot.current > shootInterval) {
        createProjectile();
        lastShot.current = now;
        setScore(prev => prev + 1);
      }

      animationId = requestAnimationFrame(render);
    };

    // Event listener para movimento do mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      // Verificar se o mouse realmente se moveu
      const moveDistance = Math.hypot(
        newX - lastMousePos.current.x,
        newY - lastMousePos.current.y
      );
      
      if (moveDistance > 5) { // Movimento mínimo de 5 pixels
        lastMousePos.current = { x: newX, y: newY };
        lastMouseMoveTime.current = Date.now();
      }
      
      mousePos.current = {
        x: newX,
        y: newY
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
    lastMouseMoveTime.current = Date.now();
    isMouseStatic.current = false;
    cursorShakeIntensity.current = 0;
  };

  // Função para definir cor do HP
  const getHpColor = (hp: number) => {
    if (hp > 30) return '#00ff00';
    if (hp > 10) return '#ffff00';
    return '#ff0000';
  };

  // Função para obter cor do brilho do projétil
  const getGlowColor = (color: string) => {
    if (color === '#ff0000') return '#ff6666';
    if (color === '#ff4500') return '#ff8c00';
    if (color === '#8b0000') return '#cd5c5c';
    return '#ffb6c1';
  };

  // Função para obter nível de dificuldade atual
  const getCurrentDifficultyLevel = () => {
    const timeSinceStart = Date.now() - gameStartTime.current;
    return Math.floor(timeSinceStart / 15000);
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
      {/* Título do jogo */}
      <h1 style={{ color: 'white', marginBottom: '20px' }}>
        👁️ Jogo do Olho Diabólico
      </h1>

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
        <div style={{ color: '#ffff00' }}>
          � Nível: {getCurrentDifficultyLevel() + 1}
        </div>
        <div style={{ color: '#00bfff' }}>
          🎯 Tiros: {score}
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
              � Jogar Novamente
            </button>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div style={{ 
        marginTop: '20px', 
        color: '#ccc', 
        textAlign: 'center',
        maxWidth: '700px',
        lineHeight: '1.5'
      }}>
        <p><strong>🎮 Como Jogar:</strong></p>
        <p>• Mova o mouse para controlar seu cursor (ponto verde)</p>
        <p>• <strong>💥 Feedback de Dano:</strong> Seu cursor treme quando você toma dano!</p>
        <p>• <strong>🎯 Sistema de Tiros:</strong> O olho atira diretamente no mouse + tiros aleatórios!</p>
        <p>• <strong>⚠️ CUIDADO:</strong> Se ficar parado por 2s, ativa spray de 6 tiros em círculo!</p>
        <p>• <span style={{color: '#ffff00'}}>Amarelo pulsante</span>: Aviso | <span style={{color: '#ff0000'}}>Vermelho</span>: Spray ativo</p>
        <p>• <span style={{color: '#ff0000'}}>Projéteis vermelhos</span>: 10 dano | <span style={{color: '#ff4500'}}>Laranja</span>: 15 dano</p>
        <p>• <span style={{color: '#8b0000'}}>Vermelho escuro</span>: 20 dano | <span style={{color: '#ff69b4'}}>Rosa</span>: 5 dano (rápido)</p>
        <p>• <strong>Por nível:</strong> 1=1 aleatório, 2=2 aleatórios, 3=3 aleatórios, 4+=4 aleatórios + múltiplos</p>
        <p>• <strong>Estratégia:</strong> Não existe posição segura - mantenha-se em movimento!</p>
      </div>
    </div>
  );
}