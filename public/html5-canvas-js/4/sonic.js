import { SpriteSheet } from "./spritesheet.js"
const SONIC_DIREITA = 1
const SONIC_ESQUERDA = 2
const SETA_ESQUERDA = 37;
const SETA_DIREITA = 39;
const ESPACO = 32;

export class Sonic {
  constructor(context, teclado, imagem) {
    this.context = context
    this.teclado = teclado
    this.x = 0
    this.y = 0
    this.velocidade = 10

    this.sheet = new SpriteSheet(context, imagem, 3, 8)
    this.sheet.intervalo = 60

    this.andando = false
    this.direcao = SONIC_DIREITA
  }

  atualizar() {
    if (this.teclado.pressionada(SETA_DIREITA)) { // esquerda
      if (!this.andando || this.direcao != SONIC_DIREITA) {
        this.sheet.linha = 1
        this.coluna = 0
      }

      this.andando = true
      this.direcao = SONIC_DIREITA

      this.sheet.proximoQuadro()

      this.x += this.velocidade

    } else if (this.teclado.pressionada(SETA_ESQUERDA)) {// direita
      if (!this.andando || this.direcao != SONIC_ESQUERDA) {
        this.sheet.linha = 2
        this.coluna = 0
      }

      this.andando = true
      this.direcao = SONIC_ESQUERDA      
      this.sheet.proximoQuadro()
      this.x -= this.velocidade

    }else{
      if(this.direcao == SONIC_DIREITA){       
        this.sheet.coluna = 0
      }else if(this.direcao == SONIC_ESQUERDA){
        this.sheet.coluna = 1
      }

      this.sheet.linha = 0
      this.andando = false
    }
  }

  desenhar() {
    this.sheet.desenhar(this.x, this.y)
  }
}