class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Fondo estilo estudio de TV con pantalla LED
    const bg = this.add.image(0, 0, 'menuBg')
      .setOrigin(0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setTint(0xcc0000); // Tinte rojo de alerta

    // Efecto de billetes cayendo (requiere asset)
    this.anims.create({ key: 'moneyFall', frames: this.animGenerate('money'), frameRate: 10, repeat: -1 });
    this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT, 'money')
      .play('moneyFall')
      .setScale(2)
      .setDepth(-1);

    // Contenedor principal estilo palco presidencial
    const menuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    
    // Marco estilo escenario político
    const podium = this.add.graphics()
      .fillStyle(0x000000, 0.9)
      .fillRoundedRect(-400, -250, 800, 500, 20)
      .lineStyle(4, 0xffffff)
      .strokeRoundedRect(-400, -250, 800, 500, 20);
    menuContainer.add(podium);

    // Logo animado estilo spot de campaña
    const logo = this.add.image(0, -200, 'logo')
      .setScale(0.4)
      .setAlpha(0.8);
    this.tweens.add({
      targets: logo,
      y: '-=20',
      alpha: 1,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
    menuContainer.add(logo);

    // Efecto de "spotlight" sobre el logo
    const light = this.add.graphics()
      .fillStyle(0xffffff, 0.1)
      .fillEllipse(-120, -220, 240, 60);
    menuContainer.add(light);

    // Botones estilo pancartas de protesta
    const createMenuButton = (text, yPos, scene) => {
      const btn = this.add.text(0, yPos, text.toUpperCase(), {
        fontSize: '28px',
        fill: '#ffdd00',
        fontFamily: 'Impact',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, stroke: true }
      }).setOrigin(0.5);
      
      btn.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          btn.setScale(1.1).setTint(0xff0000);
          this.sound.play('menuHover');
        })
        .on('pointerout', () => btn.setScale(1).clearTint())
        .on('pointerdown', () => {
          this.sound.play('menuSelect');
          this.scene.start(scene);
        });
      return btn;
    };

    const playBtn = createMenuButton('🚀 Iniciar Revolución Libertaria', -40, 'GameScene');
    const tutBtn = createMenuButton('📖 Manual de Dogmática Económica', 40, 'TutorialScene');
    const credBtn = createMenuButton('👥 Créditos (aka Lobby de Poder)', 120, 'CreditScene');

    menuContainer.add([playBtn, tutBtn, credBtn]);

    // Ticker inferior estilo noticiero
    const newsTicker = this.add.text(0, GAME_HEIGHT - 30, '⚠️ ALERTA: Inflación sube 2% durante este menú | Último: Dólar crypto se dispara 200% | Encuesta: 9 de 10 argentinos prefieren jugar antes que ver sesiones legislativas', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#aa0000'
    }).setOrigin(0);
    this.tweens.add({
      targets: newsTicker,
      x: -newsTicker.width,
      duration: 15000,
      repeat: -1
    });

    // Indicadores económicos decorativos
    const economyWidget = this.add.container(20, 20)
      .add([
        this.add.graphics()
          .fillStyle(0x00ff00, 0.5)
          .fillRect(0, 0, 200, 20),
        this.add.text(5, 0, 'RESERVAS INTERNACIONALES:', { fontSize: '14px', fill: '#fff' }),
        this.add.text(200, 0, '$ -15.3B', { fontSize: '14px', fill: '#ff0000' }).setOrigin(1,0)
      ]);
    
    // Patrocinadores irónicos
    const sponsors = this.add.container(GAME_WIDTH - 20, GAME_HEIGHT - 60)
      .add([
        this.add.text(0, 0, 'PATROCINADO POR:\n"LIBRA COIN"\nLa cripto que nunca colapsa\n(excepto los jueves)', {
          fontSize: '14px',
          fill: '#ffff00',
          align: 'right'
        }).setOrigin(1,0),
        this.add.graphics()
          .lineStyle(2, 0xffff00)
          .strokeRect(-160, -10, 160, 50)
      ]);

    // Efecto de sonido ambiente
    this.sound.play('crowdMurmur', { loop: true });
  }
}
