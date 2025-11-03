
export class Character {
  constructor(imageSrc) {
    this.image = new Image();
    this.image.src = imageSrc;

    this.frameWidth = 52;
    this.frameHeight = 50;
    this.speed = 7;
    this.frameDelay = 5;

    this.positionX = 10;
    this.positionY = 10;
    this.frameCount = 0;
    this.frameIndex = 0;
    this.loaded = false
    this.lastDirection = 0

    this.image.onload = () => this.loaded = true

  }

  updateFrame() {
    this.frameCount++;
    if (this.frameCount % this.frameDelay === 0) {
      this.frameIndex++;
    }

    if (this.frameIndex === 7) {
      this.frameIndex = 0;
    }
  }

  draw(canvas, context, framePosition) {
    // if(!this.loaded){
    //   return
    // }
    context.clearRect(0, 0, canvas.width, canvas.height)

    const sx = this.frameIndex * this.frameWidth;
    const sy = framePosition * this.frameHeight;

    const dx = this.positionX;
    const dy = canvas.height - this.frameHeight;

    context.drawImage(
      this.image,
      sx, sy, this.frameWidth, this.frameHeight,
      dx, dy, this.frameWidth, this.frameHeight
    );
  }

  move(canvas, direction) {
    this.lastDirection = direction === 1 ? 0 : 1
    const positionX = this.positionX + direction * this.speed
    const limitedRight = Math.min(positionX, canvas.width - this.frameWidth)

    this.positionX = Math.max(0, limitedRight)
  }

}

