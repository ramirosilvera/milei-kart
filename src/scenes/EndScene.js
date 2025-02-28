class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  init(data) {
    this.finalScore = data.score;
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor final
    const endContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const endText = this.add.text(0, -50, '¡Carrera Terminada!', 
      { fontSize: '40px', fill: '#fff' }
    ).setOrigin(0.5);

    const scoreText = this.add.text(0, 0, 'Puntuación: ' + this.finalScore, 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);

    const menuBtn = this.add.text(0, 80, 'Volver al Menú', 
      { fontSize: '28px', fill: '#0f0' }
    ).setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    endContainer.add([endText, scoreText, menuBtn]);
  }
}
