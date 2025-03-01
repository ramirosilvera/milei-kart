class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.image('menuBg', 'assets/images/menu_background.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.audio('menuSelect', 'assets/sounds/menu_select.wav');
  }

  create() {
    const { width, height } = this.scale;

    // Fondo con efecto de distorsión mediática
    this.add.image(width/2, height/2, 'menuBg')
      .setDisplaySize(width, height)
      .setTint(0x1a1a1a, 0x2d2d2d, 0x444444, 0x1a1a1a)
      .setAlpha(0.95);

    // Logo con animación de aparición
    const logo = this.add.image(width/2, height * 0.15, 'logo')
      .setScale(0.65)
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(1);
    this.tweens.add({ 
      targets: logo, 
      alpha: 1, 
      y: height * 0.18, 
      duration: 1500, 
      ease: 'Sine.easeOut' 
    });

    // Contenedor principal optimizado
    const mainContainer = this.add.container(width/2, height/2);
    
    // Panel estilo informe clasificado
    const docPanel = this.add.graphics()
      .fillStyle(0x141414, 0.98)
      .fillRoundedRect(-360, -170, 720, 340, 20)
      .lineStyle(4, 0xFF4444)
      .strokeRoundedRect(-360, -170, 720, 340, 20);
    mainContainer.add(docPanel);

    // Contenido textual condensado
    const contentBox = this.add.container(-340, -150).setSize(680, 300);
    mainContainer.add(contentBox);

    const missionBrief = this.add.text(0, 0, 
      "🔥 OPERACIÓN CONTROL HEGEMÓNICO 🔥\n\n" +
      "OBJETIVO PRINCIPAL:\n" +
      "▸ Gestionar la narrativa pública\n" +
      "▸ Neutralizar voces opositoras\n" +
      "▸ Mantener el relato ante crisis\n\n" +
      "MECÁNICAS CLAVE:\n" +
      "• Convertir escándalos en teorías\n" +
      "• Dirigir atención con polémicas\n" +
      "• Manipular indicadores económicos",
      {
        fontSize: '22px',
        fill: '#F0F0F0',
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 660, useAdvancedWrap: true },
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);
    contentBox.add(missionBrief);

    // Botón de acción mejorado
    const startButton = this.add.text(0, 140, '[ INICIAR OPERACIÓN ]', {
      fontSize: '28px',
      fill: '#FFFFFF',
      backgroundColor: '#B71C1C',
      padding: { x: 40, y: 15 },
      borderRadius: 8,
      stroke: '#FFD600',
      strokeThickness: 3,
      shadow: { color: '#000', blur: 5, offsetX: 2, offsetY: 2 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        startButton.setScale(1.05).setTint(0xFFD600);
        this.sound.play('menuHover');
      })
      .on('pointerout', () => {
        startButton.setScale(1).clearTint();
      })
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('MenuScene');
      });
    mainContainer.add(startButton);

    // Nota al pie contextual
    this.add.text(width/2, height - 30,
      "Toda similitud con la realidad es pura estrategia comunicacional",
      {
        fontSize: '14px',
        fill: '#808080',
        fontStyle: 'italic',
        align: 'center'
      }
    ).setOrigin(0.5);
  }
}