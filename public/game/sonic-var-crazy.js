
// const canvas = document.querySelector('canvas');
// const context = canvas.getContext('2d');

// canvas.width = 400;
// canvas.height = 300;
// canvas.style.border = '1px solid black';

// const sprite = new Image();
// sprite.src = './spritesheet.png';

// sprite.onload = () => drawImage(0, 0);

// const frameWidth = 52;
// const frameHeight = 50;

// let positionX = 10;
// let positionY = 10;

// const speed = 10;

// const keys = {
//   ArrowRight:false,
//   ArrowLeft:false
// }

// let frameIndex = 0

// document.addEventListener('keydown', (event) => {
//   // rowIndex++;
//   keys[event.key] = true;
// })

// document.addEventListener('keyup', (event) => {
//   keys[event.key] = false;
//   // rowIndex = 0;
//   if(event.key === 'ArrowRight') drawImage(0, 0, positionX);
//   if(event.key === 'ArrowLeft') drawImage(1, 0, positionX);
// });


// function drawImage(frameIndex, rowIndex, dx = 10) {
//   context.clearRect(0, 0, canvas.width, canvas.height);
 
 
//   const sx = frameIndex * frameWidth; // Posição x no spritesheet
//   const sy = rowIndex * frameHeight; // Posição y no spritesheet

//   const sw = frameWidth; // Largura do sprite
//   const sh = frameHeight; // Altura do sprite

//   // const dx = 10; // Posição x no canvas
//   const dy = canvas.height - frameHeight; // Posição y no canvas
//   const dw = frameWidth; // Largura no canvas
//   const dh = frameHeight; // Altura no canvas

//   context.drawImage(
//     sprite,
//     sx, sy, sw, sh, // área recortada da imagem original
//     dx, dy, dw, dh  // posição e tamanho no canvas
//   );
// }

// let frameCount = 0;

// function frameDelay(){
//   frameCount++ 
//   const delay = 4;

//   if(frameCount % delay === 0){
//     frameIndex++;
//   }

//   if(frameIndex ===  7){
//     frameIndex = 0;
//   }
// }

// function loop() {

 
//   if (keys.ArrowRight ) {
//     drawImage(frameIndex, 1, positionX);
//     positionX += speed;
//     frameDelay()
//   }


//   if (keys.ArrowLeft) {
//     drawImage(frameIndex, 2, positionX);
//     positionX -= speed;
//     frameDelay()
//   }


//   requestAnimationFrame(loop)
// }

// loop()