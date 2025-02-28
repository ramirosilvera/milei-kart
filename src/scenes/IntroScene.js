class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor para la narrativa
    const introContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo semitransparente
    const introBg = this.add.graphics();
    introBg.fillStyle(0x000000, 0.6);
    introBg.fillRoundedRect(-350, -200, 700, 400, 20);
    introContainer.add(introBg);

    // Texto de introducción
    const introText = this.add.text(0, -150,
      "Milei Kart: Carrera Manipuladora\n\n" +
      "Milei manipula la opinión pública para ganarse el apoyo de sus votantes. " +
      "Sus estrategias se representan en este juego. Además, está envuelto en un escándalo " +
      "por promocionar una estafa cripto, dejando el futuro económico del país en la incertidumbre.\n\n" +
      "¿Listo para desafiar sus maniobras y salir victorioso?",
      { 
        fontSize: '16px', 
        fill: '#fff', 
        align: 'center', 
        wordWrap: { width: 650 } 
      }
    ).setOrigin(0.5);
    introContainer.add(introText);

    // Botón para continuar
    const continueText = this.add.text(0, 120, 'Continuar', 
      { fontSize: '24px', fill: '#0f0' }
    ).setOrigin(0.5);
    continueText.setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    introContainer.add(continueText);
  }
}
