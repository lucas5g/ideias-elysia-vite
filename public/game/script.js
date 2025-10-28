const character = document.querySelector('#character');
const gameElement = document.querySelector('#game');
const sword = document.querySelector('#sword');
const bullet = document.querySelector('.bullet');
let startGame = false;

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

const position = {
  y: 550,
  x: gameElement.clientWidth / 2,
};

// Array para armazenar todas as balas ativas
const bullets = [];


document.addEventListener('keydown', (event) => {
  startGame = true;
  if (event.key in keys) {
    keys[event.key] = true;
  }

  if (event.key === ' ') {
    // Criar uma nova bala e adicionar ao array
    const newBullet = document.createElement('div');
    newBullet.className = 'bullet';
    newBullet.style.position = 'absolute';
    newBullet.style.display = 'block';
    
    gameElement.appendChild(newBullet);

    // Adicionar ao array com posição inicial
    bullets.push({
      element: newBullet,
      x: position.x + character.clientWidth / 2,
      y: position.y
    });
  }
})
document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
})


function gameLoop() {
  const speed = 10
  if (keys.ArrowUp) {
    position.y -= speed;
  }

  if (keys.ArrowDown) {
    position.y += speed;
  }

  if (keys.ArrowLeft) {
    position.x -= speed;
  }

  if (keys.ArrowRight) {
    position.x += speed;
  }

  // Limitar personagem dentro das bordas do game
  const gameWidth = gameElement.clientWidth;
  const gameHeight = gameElement.clientHeight;

  position.x = Math.max(0, Math.min(gameWidth - character.clientWidth, position.x));
  position.y = Math.max(0, Math.min(gameHeight - character.clientHeight, position.y));

  // Atualizar posição do personagem
  character.style.left = `${position.x}px`;
  character.style.top = `${position.y}px`;

  // Atualizar todas as balas
  const bulletSpeed = 10;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    // Move a bala para cima
    bullet.y -= bulletSpeed;
    
    // Atualizar posição no DOM
    bullet.element.style.left = `${bullet.x}px`;
    bullet.element.style.top = `${bullet.y}px`;
    
    // Remover balas que saíram da tela
    if (bullet.y < -20) {
      bullet.element.remove();
      bullets.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();