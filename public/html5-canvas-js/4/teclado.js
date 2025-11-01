const SETA_ESQUERDA = 37;
const SETA_DIREITA = 39;
const ESPACO = 32;

export class Teclado {
  constructor(elemento) {
    this.elemento = elemento

    this.pressionadas = []

    this.disparadas = []

    this.funcoesDisparo = []

    const teclado = this

    elemento.addEventListener("keydown", (evento) => {

      const tecla = evento.keyCode

      teclado.pressionadas[tecla] = true

      if (teclado.funcoesDisparo[tecla] && !teclado.disparadas[tecla]) {
        teclado.disparadas[tecla] = true
        teclado.funcoesDisparo[tecla]()
      }

    })

    elemento.addEventListener("keyup", (evento) => {
      const tecla = evento.keyCode
      teclado.pressionadas[tecla] = false
      teclado.disparadas[tecla] = false
    })
  }

  pressionada(tecla){
    return this.pressionadas[tecla] === true
  }

  disparar(tecla, funcao){
    this.funcoesDisparo[tecla] = funcao
  }

}