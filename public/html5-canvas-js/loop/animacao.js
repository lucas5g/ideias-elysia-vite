export class Animacao {
  constructor(context) {
    this.context = context;
    this.sprites = [];
    this.ligado = false;
  }

  novoSprinte(sprite) {
    this.sprites.push(sprite);
  }

  ligar() {
    this.ligado = true;
    this.proximoFrame();
  }

  desligar() {
    this.ligado = false;
  }

  proximoFrame() {
    if (!this.ligado) return;

    this.limparTela();

    for (const sprite in this.sprites) {
      this.sprites[sprite].atualizar();
      this.sprites[sprite].desenhar();
      // sprite.atualizar();
      // sprite.desenhar();
    }
    requestAnimationFrame(() => this.proximoFrame());
  }

  limparTela() {
    const ctx = this.context
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

}