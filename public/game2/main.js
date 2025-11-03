const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
import { Character } from "./character.js";

// import { Game } from "./game.js";

const sonic = new Character('./spritesheet.png');
sonic.image.onload = () => {
  sonic.draw(canvas, context, 0);
};  
const keys = {
  ArrowLeft: false,
  ArrowRight: false
};

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => {
  keys[e.code] = false

  if (e.code === 'ArrowRight') {
    sonic.frameIndex = 0
  }
  if (e.code === 'ArrowLeft') {
    sonic.frameIndex = 1
  }

  sonic.draw(canvas, context, 0);

});

function start() {
  if (keys.ArrowLeft || keys.ArrowRight) {
    const direction = keys.ArrowRight ? 1 : -1;


    sonic.move(canvas, direction)
    sonic.updateFrame()
    sonic.draw(canvas, context, direction === 1 ? 1 : 2)

  }



  requestAnimationFrame(start)
}
start()
