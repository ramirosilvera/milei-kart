class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor tutorial
    const tutorialContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo semitransparente
    const tutBg = this.add.graphics();
    tutBg.fillStyle(0x000000, 0.7);
    tutBg.fillRoundedRect(-350, -200, 700, 400, 20);
    tutorialContainer.add(tutBg);

    // Título
    const title = this.add.text(0, -170, 'Tutorial', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);

    // Instrucciones
    const instructions =
      "Controles:\n" +
      "Flechas: Mover\n" +
      "Botón ATAQUE: Realizar ataque\n\n" +
      "Power-ups:\n" +
      "- Gasolina de Desinformación: Acelera y confunde\n" +
      "- Bombas de Retuits: Detienen rivales\n" +
      "- Escudo de Privilegio: Protección temporal\n" +
      "- Chispas de Hostigamiento: Ataque directo\n\n" +
      "Suma puntos recogiendo power-ups y usando ataques.\n" +
      "Evita colisiones innecesarias. ¡Buena suerte!";

    const instrText = this.add.text(0, -40, instructions, 
      { fontSize: '16px', fill: '#fff', align: 'center', wordWrap: { width: 650 } }
    ).setOrigin(0.5);

    // Botón para iniciar carrera
    const startBtn = this.add.text(0, 140, 'Empezar Carrera', 
      { fontSize: '28px', fill: '#0f0' }
    ).setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('GameScene');
    });

    tutorialContainer.add([title, instrText, startBtn]);
  }
}
