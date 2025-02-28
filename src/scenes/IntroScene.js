class IntroScene extends Phaser.Scene { // Corregido el nombre de la clase
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    // Precargar assets si es necesario
    this.load.image('menuBg', 'assets/background.jpg');
  }

  create() {
    // Configurar dimensiones
    const { width, height } = this.scale;

    // Fondo con imagen
    this.add.image(0, 0, 'menuBg')
      .setOrigin(0)
      .setDisplaySize(width, height);

    // Contenedor principal
    const dialog = this.add.container(width / 2, height / 2 - 30);

    // Fondo del diálogo
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x000000, 0.85);
    dialogBg.lineStyle(3, 0xFFFFFF, 0.3);
    dialogBg.fillRoundedRect(-280, -140, 560, 280, 20);
    dialogBg.strokeRoundedRect(-280, -140, 560, 280, 20);
    dialog.add(dialogBg);

    // Elementos de texto
    const title = this.add.text(0, -110, 'MILEI KART', {
      fontSize: '32px',
      fill: '#FF4444',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -70, 'Carrera contra la inflación', {
      fontSize: '18px',
      fill: '#FFFFFF',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    const content = this.add.text(0, -20, 
      "En esta pista encontrarás:\n" +
      "► Promesas de campaña volátiles\n" +
      "► Recortes express en cada curva\n" +
      "► Bonus tracks de retórica viral\n\n" +
      "¿Llegarás a la meta sin caer\nen las cripto-trampas?",
      {
        fontSize: '18px',
        fill: '#EEE',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5);

    // Botón funcional
    const startButton = this.add.text(0, 90, 'INICIAR AJUSTE', {
      fontSize: '24px',
      fill: '#FFF',
      backgroundColor: '#D32F2F',
      padding: { x: 25, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => startButton.setAlpha(0.9))
      .on('pointerout', () => startButton.setAlpha(1))
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('MenuScene');
      });

    // Añadir elementos al contenedor
    dialog.add([title, subtitle, content, startButton]);

    // Texto legal
    this.add.text(width / 2, height - 30,
      "* Las reglas del juego cambian con cada anuncio oficial",
      {
        fontSize: '12px',
        fill: '#AAA',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
  }
}