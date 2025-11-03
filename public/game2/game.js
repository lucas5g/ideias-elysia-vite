export class Game {
  constructor(character) {
    this.canvas = document.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.keys = {};
    this.character = character;

    document.addEventListener('keydown', event => this.keys[event.key] = true);
    document.addEventListener('keyup', event => this.keys[event.key] = false);
  }

  start() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // this.character.draw(this.canvas, this.context, 0);
    this.character.move()
    
    requestAnimationFrame(() => this.start())
  }
}