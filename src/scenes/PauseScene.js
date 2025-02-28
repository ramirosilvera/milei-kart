class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    // Fondo semitransparente para indicar pausa
    const pauseBg = this.add.graphics();
    pauseBg.fillStyle(0x000000, 0.6);
    pauseBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Contenedor
    const pauseContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const pauseText = this.add.text(0, -50, 'Juego en Pausa', 
      { fontSize: '40px', fill: '#fff' }
    ).setOrigin(0.5);

    // Botón reanudar
    const resumeBtn = this.add.text(0, 20, 'Reanudar', 
      { fontSize: '28px', fill: '#0f0' }
    ).setOrigin(0.5);
    resumeBtn.setInteractive({ useHandCursor: true });
    resumeBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      // Retomar GameScene
      this.scene.stop();         // cierra PauseScene
      this.scene.resume('GameScene'); 
    });

    // Botón menú principal
    const menuBtn = this.add.text(0, 80, 'Salir al Menú', 
      { fontSize: '24px', fill: '#fff' }
    ).setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      // Detiene GameScene y va al menú
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });

    pauseContainer.add([pauseText, resumeBtn, menuBtn]);
  }
}
