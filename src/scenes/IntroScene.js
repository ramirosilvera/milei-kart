class IntroScene extends Phaser.Scaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Fondo con efecto de paralaje
    const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor principal centrado
    const dialog = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);

    // Fondo de diálogo con borde
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x000000, 0.85);
    dialogBg.lineStyle(3, 0xFFFFFF, 0.3);
    dialogBg.fillRoundedRect(-280, -140, 560, 280, 20);
    dialogBg.strokeRoundedRect(-280, -140, 560, 280, 20);
    dialog.add(dialogBg);

    // Título principal
    const title = this.add.text(0, -110, 'MILEI KART', {
      fontSize: '32px',
      fill: '#FF4444',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5);
    dialog.add(title);

    // Subtítulo
    const subtitle = this.add.text(0, -70, 'Carrera contra la inflación', {
      fontSize: '18px',
      fill: '#FFFFFF',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    dialog.add(subtitle);

    // Cuerpo del texto
    const content = this.add.text(0, -20, 
      "En esta pista encontrarás:\n" +
      "► Promesas de campaña volatiles\n" +
      "► Recortes express en cada curva\n" +
      "► Bonus tracks de retórica viral\n\n" +
      "¿Podrás llegar a la meta\nsin caer en las cripto-trampas?",
      {
        fontSize: '18px',
        fill: '#EEE',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5);
    dialog.add(content);

    // Botón principal
    const startButton = this.add.text(0, 90, 'INICIAR AJUSTE', {
      fontSize: '24px',
      fill: '#FFF',
      backgroundColor: '#D32F2F',
      padding: { x: 25, y: 10 },
      borderRadius: 5
    }).setOrigin(0.5);

    // Interactividad del botón
    startButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => startButton.setAlpha(0.9))
      .on('pointerout', () => startButton.setAlpha(1))
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('MenuScene');
      });
    dialog.add(startButton);

    // Texto legal inferior
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 30,
      "* Las reglas del juego cambian con cada anuncio oficial",
      {
        fontSize: '12px',
        fill: '#AAA',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
  }
}