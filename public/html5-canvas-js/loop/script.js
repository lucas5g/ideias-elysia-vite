import { Animacao } from "./animacao.js";
import { Bola } from "./bola.js";

const canvas = document.getElementById('meu_canvas');
const context = canvas.getContext('2d');

const b1 = new Bola(context);
b1.x = 100
b1.y = 200
b1.velocidadeX = 1
b1.velocidadeY = -10
b1.cor = 'red'
b1.raio = 20

const b2 = new Bola(context);
b2.x = 200
b2.y = 100
b2.velocidadeX = -50
b2.velocidadeY = 20
b2.cor = 'blue'
b2.raio = 30

const animacao = new Animacao(context);
animacao.novoSprinte(b1);
animacao.novoSprinte(b2);
animacao.ligar();


// const meuCarro = new Carro('vermelho', 250);
// const oponente = new Carro('azul', 300);

// document.querySelector('#test1').innerHTML = meuCarro.cor + ': ' + meuCarro.velocMaxima + 'km/h';
// document.querySelector('#test2').innerHTML = oponente.cor + ': ' + oponente.velocMaxima + 'km/h';



// let x = 20
// const y = 100
// const raio = 5
// const anterio = new Date().getTime();
// const velocidade = 1

// function mexerBola() {

//   const agora = new Date().getTime();
//   const decorrido = agora - anterio;

//   context.clearRect(0, 0, canvas.width, canvas.height);

//   context.beginPath();
//   context.arc(x, y, raio, 0, Math.PI * 2);
//   context.fill();
//   x +=  velocidade * decorrido / 1000;
//   console.log(x);
//   requestAnimationFrame(mexerBola);
// }

// mexerBola();


// context.fillStyle = 'green';
// context.fillRect(50, 50, 25, 25);
// context.save(); 

// context.fillStyle = 'purple';
// context.fillRect(100, 50, 25, 25);

// context.restore();

// context.fillRect(150, 50, 25, 25);



// const image = new Image();
// image.src = './images/explosao.png';

// image.onload = () => {
//  context.drawImage(
//     image, 
//     80, 10, 60, 65,
//     20, 20, 64, 64
//   );
// }

// image.src = './images/ovni.png';

// image.onload = () => {
//   let x = 20;
//   for(let i = 0; i <= 5; i++) {
//     context.drawImage(image, x, 20, 64, 32);
//     x += 70;
//   }
// }



// context.beginPath();
// context.arc(250, 50, 40, 0, 2*Math.PI);
// context.fill();
// context.stroke()

// // context.fillStyle = 'red';
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