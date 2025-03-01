class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Fondo con efecto de crisis permanente
    this.add.image(width/2, height/2, 'menuBg')
      .setDisplaySize(width, height)
      .setTint(0x1a1a1a)
      .setAlpha(0.95);

    // Contenedor principal estilo centro de operaciones
    const menuPanel = this.add.container(width/2, height/2);
    
    // Marco estilo informe confidencial
    menuPanel.add(this.add.graphics()
      .fillStyle(0x2d2d2d, 0.98)
      .fillRoundedRect(-300, -180, 600, 360, 20)
      .lineStyle(3, 0xFF4444)
      .strokeRoundedRect(-300, -180, 600, 360, 20)
    );

    // Titular alineado con la narrativa
    menuPanel.add(this.add.text(0, -150, 'CENTRO DE CONTROL HEGEMÓNICO', {
      fontSize: '28px',
      fill: '#FF5555',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5));

    // Función para creación de botones
    const createBtn = (y, text, scene) => {
      return this.add.text(0, y, text, {
        fontSize: '24px',
        fill: '#FFF',
        backgroundColor: '#B71C1C',
        padding: { x: 30, y: 12 },
        borderRadius: 8,
        stroke: '#FFD600',
        strokeThickness: 2
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          this.sound.play('menuHover');
          this.tweens.add({ targets: this, scale: 1.05, duration: 100 });
        })
        .on('pointerout', () => this.tweens.add({ targets: this, scale: 1, duration: 100 }))
        .on('pointerdown', () => {
          this.sound.play('menuSelect');
          this.scene.start(scene);
        });
    };

    // Botones principales
    menuPanel.add([
      createBtn(-50, '🕹️ INICIAR MANIPULACIÓN', 'GameScene'),
      createBtn(50, '📜 PROTOCOLO DE SHOCK', 'TutorialScene')
    ]);

    // Ticker de noticias estilo cadena nacional
    const newsTicker = this.add.text(0, height - 40, 
      'ÚLTIMO: Dólar blue supera los $1500 | Nuevo DNU permite privatizar el aire | Encuesta oficial: 98% de aprobación (muestra: 50 personas)',
      {
        fontSize: '18px',
        fill: '#FFFFFF',
        backgroundColor: '#D32F2F'
      }
    ).setOrigin(0, 0.5);
    
    this.tweens.add({
      targets: newsTicker,
      x: -newsTicker.width,
      duration: 15000,
      repeat: -1
    });

    // Widget de indicadores críticos
    this.add.text(20, 20, 'CRISIS ACTUAL:\n• Inflación: 15.3%\n• Reservas: -$12.450M', {
      fontSize: '16px',
      fill: '#FF5555',
      lineSpacing: 8
    });

    // Patrocinio irónico actualizado
    this.add.text(width - 20, height - 30, 'PATROCINADO POR:\n"CRYPTO FUTURE"', {
      fontSize: '16px',
      fill: '#FFD600',
      align: 'right'
    }).setOrigin(1, 0.5);
  }
}