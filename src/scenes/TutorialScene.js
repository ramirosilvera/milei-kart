class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Fondo minimalista
    this.add.image(width/2, height/2, 'menuBg')
      .setDisplaySize(width, height)
      .setTint(0x1a1a1a);

    // Contenedor principal
    const tutorialBox = this.add.container(width/2, height/2);
    
    // Marco estilo informe de gobierno
    const frame = this.add.graphics()
      .fillStyle(0x2d2d2d, 0.95)
      .fillRoundedRect(-350, -200, 700, 400, 15)
      .lineStyle(3, 0xff4444)
      .strokeRoundedRect(-350, -200, 700, 400, 15);
    tutorialBox.add(frame);

    // Instrucciones clave
    const content = this.add.text(0, -150, 
      "🔥 MANUAL DE SUPREMACÍA NARRATIVA 🔥\n\n" +
      "▸ Usa ←→ para girar escándalos a tu favor\n" +
      "▸ ↑ Acelera la máquina de fake news\n" +
      "▸ ↓ Silencia datos económicos incómodos\n\n" +
      "💣 POWER-UPS CLAVE:\n" +
      "• Cortinas de humo (desvío de atención)\n" +
      "• Dolarización express (congela precios)\n" +
      "• Bots oficialistas (ataque a opositores)\n\n" +
      "⚠️ AMENAZAS:\n" +
      "• Datos reales (-30% credibilidad)\n" +
      "• Filtraciones explosivas (-50% apoyo)",
      {
        fontSize: '20px',
        fill: '#f0f0f0',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 650 }
      }
    ).setOrigin(0.5);
    tutorialBox.add(content);

    // Botón verificado con transición
    const startBtn = this.add.text(0, 140, '[ ACTIVAR PROTOCOLO DE SHOCK ]', {
      fontSize: '24px',
      fill: '#FFFFFF',
      backgroundColor: '#B71C1C',
      padding: { x: 25, y: 10 },
      borderRadius: 6
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => startBtn.setScale(1.05))
      .on('pointerout', () => startBtn.setScale(1))
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('GameScene'); // Llamado confirmado
      });
    tutorialBox.add(startBtn);

    // Indicador de realidad
    this.add.text(width/2, height - 40, 
      "* Los indicadores se actualizan según el relato oficial",
      { fontSize: '14px', fill: '#888', fontStyle: 'italic' }
    ).setOrigin(0.5);
  }
}