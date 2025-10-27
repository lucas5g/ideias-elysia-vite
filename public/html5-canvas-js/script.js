const canvas = document.getElementById('meu_canvas');
const context = canvas.getContext('2d');

context.beginPath();
context.arc(250, 50, 40, 0, 2*Math.PI);
context.fill();
context.stroke()

// context.fillStyle = 'red';
// context.fillRect(50, 50, 100, 100); // Desenha 
// // context.strokeRect(50, 50, 100, 100); // Desenha um retângulo contornado
// context.lineWidth = 3;
// context.strokeStyle = 'blue';
// context.strokeRect(50, 50, 100, 100); // Desenha um retângulo contornado


// context.beginPath();

// context.moveTo(75, 250)
// context.lineTo(150, 50);
// context.lineTo(225, 250);
// context.lineTo(50, 120);
// context.lineTo(250, 120);
// context.lineTo(75, 250);

// context.lineWidth = 2;
// context.strokeStyle = 'red';

// // context.fill(); 

// context.stroke();
// context.fillStyle = 'gray';
// context.strokeStyle = 'black';
// context.lineWidth = 5;
// context.arc(
//   50,
//   50,
//   40,
//   90 * Math.PI / 180,
//   270 * Math.PI / 180,
//   false
// );