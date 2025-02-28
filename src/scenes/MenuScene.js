class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor del menú
    const menuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Logo (tamaño reducido)
    const logo = this.add.image(0, -180, 'logo').setScale(0.3);

    // Botón Jugar
    const playBtn = this.add.text(0, -20, 'Jugar', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);
    playBtn.setInteractive({ useHandCursor: true });
    playBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('TutorialScene');
    });

    // Botón Tutorial
    const tutBtn = this.add.text(0, 40, 'Tutorial', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);
    tutBtn.setInteractive({ useHandCursor: true });
    tutBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('TutorialScene');
    });

    menuContainer.add([logo, playBtn, tutBtn]);
  }
}
