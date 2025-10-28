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


document.addEventListener('keydown', (event) => {
  startGame = true;
  if (event.key in keys) {
    keys[event.key] = true;
  }

  if (event.key === ' ') {
    console.log('Atirar!');
    bullet.classList.add('shoot');
    bullet.style.display = 'block'; 
    bullet.style.left = `${position.x + 25}px`;
    // bullet.style.top = `${position.y + 20}px`;
    setTimeout(() => {
      bullet.style.display = 'none';
      bullet.classList.remove('shoot');
    }, 300);
    // console.log('Pular!');
  }
})
document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
})


const position = {
  x: 0,
  y: 550
}
function gameLoop() {

  // if (!startGame) {
  //   return;
  // }

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

  const gameWidth = gameElement.clientWidth;
  const gameHeight = gameElement.clientHeight;

  // if(position.x !== 0 && position.y !== 550){
  // }
    position.x = Math.max(0, Math.min(gameWidth - character.clientWidth, position.x));
    position.y = Math.max(0, Math.min(gameHeight - character.clientHeight, position.y));
  // console.log('position', position);
  // character.style.transform = `translate(${position.x}px, ${position.y}px)`;
  character.style.left = `${position.x}px`;
  character.style.top = `${position.y}px`;
  requestAnimationFrame(gameLoop);
}

gameLoop();