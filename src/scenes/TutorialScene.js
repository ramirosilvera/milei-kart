class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    // Fondo de la pantalla de tutorial
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor central para agrupar el contenido
    const tutorialContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo semitransparente para mejorar la legibilidad del texto
    const tutBg = this.add.graphics();
    tutBg.fillStyle(0x000000, 0.7);
    tutBg.fillRoundedRect(-350, -220, 700, 440, 20);
    tutorialContainer.add(tutBg);

    // Título del tutorial
    const title = this.add.text(0, -200, 'Tutorial', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Instrucciones actualizadas
    const instructions =
      "Controles:\n" +
      "• Flechas Izquierda/Derecha: Girar\n" +
      "• Flecha Arriba: Acelerar\n" +
      "• Flecha Abajo: Frenar\n" +
      "• Botón ATAQUE: Atacar\n\n" +
      "Objetivo de la Carrera:\n" +
      "• Tanto tú como el oponente tienen 100 puntos de salud.\n" +
      "• Usa ataques y colisiones para reducir la salud del adversario a 0.\n\n" +
      "Otros Elementos:\n" +
      "• Obstáculos: Evítalos, ya que dañan tu salud.\n" +
      "• Power-ups: Recógelos para ganar puntos y potenciar tu rendimiento.\n\n" +
      "¡Gana la carrera siendo el primero en dejar sin salud a tu oponente!";

    const instrText = this.add.text(0, -80, instructions, {
      fontSize: '16px',
      fill: '#fff',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5);

    // Botón para iniciar la carrera
    const startBtn = this.add.text(0, 180, 'Empezar Carrera', { fontSize: '28px', fill: '#0f0' }).setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('GameScene');
    });

    tutorialContainer.add([title, instrText, startBtn]);
  }
}
