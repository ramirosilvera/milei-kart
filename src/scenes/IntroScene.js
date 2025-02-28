class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    // Precargar assets con rutas correctas
    this.load.image('menuBg', 'assets/images/menu_background.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.audio('menuSelect', 'assets/sounds/menu_select.wav');
  }

  create() {
    // Configuración de dimensiones
    const { width, height } = this.scale;

    // Fondo del menú
    this.add.image(width/2, height/2, 'menuBg')
      .setDisplaySize(width, height);

    // Logo del juego
    this.add.image(width/2, 150, 'logo')
      .setScale(0.8)
      .setOrigin(0.5);

    // Contenedor principal
    const dialog = this.add.container(width/2, height/2 + 50);

    // Fondo del diálogo con diseño mejorado
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x1a1a1a, 0.95);
    dialogBg.lineStyle(2, 0xFF4444, 0.8);
    dialogBg.fillRoundedRect(-250, -100, 500, 250, 15);
    dialogBg.strokeRoundedRect(-250, -100, 500, 250, 15);
    dialog.add(dialogBg);

    // Texto de contenido actualizado
    const content = this.add.text(0, -40, 
      "¡Prepárate para la carrera política!\n\n" +
      "▸ Esquiva la inflación galopante\n" +
      "▸ Colecta polémicos power-ups\n" +
      "▸ Supera a tus rivales ideológicos",
      {
        fontSize: '20px',
        fill: '#FFFFFF',
        align: 'center',
        lineSpacing: 12
      }
    ).setOrigin(0.5);
    dialog.add(content);

    // Botón de inicio con diseño coherente
    const startButton = this.add.text(0, 80, 'INICIAR CAMPAÑA', {
      fontSize: '24px',
      fill: '#FFFFFF',
      backgroundColor: '#D32F2F',
      padding: { x: 30, y: 12 },
      borderRadius: 8,
      stroke: '#FFC107',
      strokeThickness: 2
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        startButton.setScale(1.05);
        startButton.setStyle({ fill: '#FFC107' });
      })
      .on('pointerout', () => {
        startButton.setScale(1);
        startButton.setStyle({ fill: '#FFFFFF' });
      })
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('MenuScene');
      });
    dialog.add(startButton);

    // Texto de créditos
    this.add.text(width/2, height - 20,
      "¡Las reglas cambian con cada encuesta!",
      {
        fontSize: '14px',
        fill: '#888888',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
  }
}