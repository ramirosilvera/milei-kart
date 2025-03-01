class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Fondo con efecto de devaluación
    this.add.image(width/2, height/2, 'menuBg')
      .setDisplaySize(width, height)
      .setTint(0xcc0000)
      .setAlpha(0.9);

    // Contenedor principal minimalista
    const menuPanel = this.add.container(width/2, height/2);
    
    // Marco estilo informe económico
    menuPanel.add(this.add.graphics()
      .fillStyle(0x1a1a1a, 0.95)
      .fillRoundedRect(-300, -150, 600, 300, 20)
      .lineStyle(3, 0xFF4444)
      .strokeRoundedRect(-300, -150, 600, 300, 20)
    );

    // Titular impactante
    menuPanel.add(this.add.text(0, -120, 'MANDO DE CRISIS', {
      fontSize: '32px',
      fill: '#FF5555',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5));

    // Menú conciso
    const createBtn = (y, text, scene) => {
      return this.add.text(0, y, text, {
        fontSize: '24px',
        fill: '#FFF',
        backgroundColor: '#B71C1C',
        padding: { x: 20, y: 8 },
        borderRadius: 5
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.sound.play('menuHover'))
        .on('pointerdown', () => this.scene.start(scene));
    };

    menuPanel.add([
      createBtn(-40, '🔥 Iniciar Caos Sistémico', 'GameScene'),
      createBtn(30, '📜 Manual de Shock', 'TutorialScene'),
      createBtn(100, '💀 Lobby de Poder', 'CreditScene')
    ]);

    // Ticker de noticias rotativo
    const newsLines = [
      'ALERTA: Inflación +15% en 72hs',
      'ULTIMO: Nuevo DNU permite privatizar órganos',
      'OFICIAL: "La pobreza bajó 200%" (muestra: Recoleta)',
      'CRIPTO: DollarCoin pierde 90% en 24hs'
    ];
    
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.add.text(width, height - 30, newsLines[Math.floor(Math.random() * 4)], {
          fontSize: '18px',
          fill: '#FFF',
          backgroundColor: '#D32F2F'
        }).setOrigin(0, 0.5)
          .setDepth(1)
          .setScrollFactor(0)
          .setX(width)
          .setAlpha(0)
          .setData('alive', true)
          .setData('timer', this.tweens.add({
            targets: this,
            props: {
              x: { value: -width, duration: 10000 }
            },
            onComplete: () => this.destroy()
          }));
      },
      loop: true
    });

    // Indicador económico minimalista
    this.add.text(20, 20, 'RESERVAS: -$15.3B', {
      fontSize: '18px',
      fill: '#FF5555',
      fontStyle: 'bold'
    });

    // Patrocinio irónico
    this.add.text(width - 20, height - 30, 'Con el apoyo de:\n🦅 Fondo Buitre Global', {
      fontSize: '14px',
      fill: '#FFD600',
      align: 'right'
    }).setOrigin(1, 0.5);
  }
}