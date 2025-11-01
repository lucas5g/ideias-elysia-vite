
import { Animacao } from "./animacao.js";
import { Sonic } from "./sonic.js";
// import { Sprite } from "./sprite.js";
import { Teclado } from "./teclado.js";

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const teclado = new Teclado(document);
const animacao = new Animacao(context);


const imgSonic = new Image();
imgSonic.src = './spritesheet.png';

const sonic = new Sonic(context, teclado, imgSonic);
sonic.x = 0;
sonic.y = 200

animacao.novoSprite(sonic);

imgSonic.onload = () => {
  animacao.ligar();
};

//correndo animação com spritesheet
// import { Spritesheet } from "./spritesheet.js";

// const context = document.querySelector('canvas').getContext('2d');

// const imgSonic = new Image();
// imgSonic.src = './spritesheet.png';

// const sheet = new Spritesheet(context, imgSonic, 3, 8);

// sheet.intervalo = 60;

// sheet.linha = 1; // linha de animação (0 = parado, 1 = andando direita, 2 = andando esquerda)

// imgSonic.onload = gameLoop;

// function gameLoop() {
//   context.clearRect(0, 0, context.canvas.width, context.canvas.height);

//   sheet.proximoQuadro();
//   sheet.desenhar(100, 100);

//   requestAnimationFrame(gameLoop);
// }

//mostrar parte de uma imagem (spritesheet)
// const imgSonic = new Image();
// imgSonic.src = './spritesheet.png';
// imgSonic.onload = () => {
//   const linhas = 3
//   const colunas = 8

//   const largura = imgSonic.width / colunas;
//   const altura = imgSonic.height / linhas;

//   const queroLinha = 2
//   const queroColuna = 7

//   const x = largura * queroColuna;
//   const y = altura * queroLinha;

//   const context = document.querySelector('canvas').getContext('2d');

//   context.drawImage(
//     imgSonic,
//     x, y, largura, altura,
//     100, 100, largura, altura
//   );
// }    
