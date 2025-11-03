const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const keys = {
  ArrowRight: false,
  ArrowLeft: false
}


const sonic = {
  image: new Image(),
  frameWidth: 52,
  frameHeight: 50,
  positionX: 10,
  positionY: 10,
  frameCount: 0,
  speed: 7,
  frameIndex: 0,
  frameDelay: 5,

  draw(rowIndex) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const sx = this.frameIndex * this.frameWidth; // Posição x no spritesheet
    const sy = rowIndex * this.frameHeight; // Posição y no spritesheet

    const dx = this.positionX
    const dy = canvas.height - this.frameHeight; // Posição y no canvas

    context.drawImage(
      this.image,
      sx, sy, this.frameWidth, this.frameHeight, // área recortada da imagem original
      dx, dy, this.frameWidth, this.frameHeight  // posição e tamanho no canvas
    );
  },

  updateFrame() {
    this.frameCount++;
    if (this.frameCount % this.frameDelay === 0) {
      this.frameIndex++;
    }

    if (this.frameIndex === 7) {
      this.frameIndex = 0;
    }
  }
}


sonic.image.src = './spritesheet.png';
sonic.image.onload = () => {
  sonic.draw(0);
};

document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
})

document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
  if (event.key === 'ArrowRight') {
    sonic.frameIndex = 0
  }

  if (event.key === 'ArrowLeft') {
    sonic.frameIndex = 1
  }


  sonic.draw(0)

});

function gameLoop() {

  if (keys.ArrowLeft || keys.ArrowRight) {

    const direction = keys.ArrowRight ? 1 : -1

    const positionX = direction * sonic.speed + sonic.positionX

    const limitedRight = Math.min(positionX, canvas.width - sonic.frameWidth)

    sonic.positionX = Math.max(0, limitedRight)
    sonic.updateFrame()
    sonic.draw(direction === 1 ? 1 : 2)
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();