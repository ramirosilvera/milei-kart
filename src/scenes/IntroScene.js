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

    // Fondo con efecto de control mediático
    this.add.image(width/2, height/2, 'menuBg')
      .setDisplaySize(width, height)
      .setTint(0x1a1a1a);

    // Logo con estilo propagandístico
    const logo = this.add.image(width/2, 100, 'logo')
      .setScale(0.7)
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(1);
    this.tweens.add({ targets: logo, alpha: 1, duration: 1000 });

    // Contenedor principal de control narrativo
    const mainContainer = this.add.container(width/2, height/2 + 30);
    
    // Fondo estilo centro de operaciones
    const panel = this.add.graphics()
      .fillStyle(0x2d2d2d, 0.98)
      .fillRoundedRect(-350, -160, 700, 320, 20)
      .lineStyle(3, 0xffd700)
      .strokeRoundedRect(-350, -160, 700, 320, 20);
    mainContainer.add(panel);

    // Texto de instrucciones en contenedor controlado
    const textBox = this.add.container(-330, -140).setSize(660, 280);
    mainContainer.add(textBox);

    const missionBrief = this.add.text(0, 0, 
      "¡OPERACIÓN CONTROL NARRATIVO!\n\n" +
      "Tu misión:\n\n" +
      "► Gestionar la maquinaria de desinformación\n" +
      "► Crear cortinas de humo con polémicas\n" +
      "► Convertir escándalos en teorías conspirativas\n" +
      "► Dirigir la ira popular contra la oposición\n\n" +
      "¿Podrás mantener el relato a pesar de\nlas crisis económicas y sociales?",
      {
        fontSize: '20px',
        fill: '#f0f0f0',
        align: 'left',
        lineSpacing: 8,
        wordWrap: { width: 640, useAdvancedWrap: true }
      }
    );
    textBox.add(missionBrief);

    // Botón de inicio funcional
    const startButton = this.add.text(0, 130, 'INICIAR MANIPULACIÓN', {
      fontSize: '26px',
      fill: '#FFFFFF',
      backgroundColor: '#4a0000',
      padding: { x: 30, y: 12 },
      borderRadius: 6,
      stroke: '#ffd700',
      strokeThickness: 2
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        startButton.setScale(1.05).setStyle({ fill: '#ffd700' });
      })
      .on('pointerout', () => {
        startButton.setScale(1).setStyle({ fill: '#FFFFFF' });
      })
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('MenuScene'); // Llamado confirmado al MenuScene
      });
    mainContainer.add(startButton);

    // Texto legal irónico
    this.add.text(width/2, height - 30,
      "* Todas las decisiones serán presentadas como 'medidas de emergencia'",
      {
        fontSize: '14px',
        fill: '#808080',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
  }
}