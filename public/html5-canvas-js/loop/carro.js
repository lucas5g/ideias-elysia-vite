export class Carro{
  
  constructor(cor, velocMaxima){
    this.cor = cor;
    this.velocMaxima = velocMaxima;
    this.velocAtual = 0;

  }

  acelerar(){
    this.velocAtual += 10;
  }
}