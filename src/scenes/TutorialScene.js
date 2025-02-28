class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    // Fondo estilo mitin político con pantalla gigante
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setTint(0xff0000); // Tinte rojo de alerta

    // Efecto de multitud animada (requiere asset)
    const crowd = this.add.sprite(0, GAME_HEIGHT - 100, 'crowd')
      .setOrigin(0)
      .play('crowdCheer');
    crowd.setScale(2.5);

    const tutorialContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Marco estilo pancarta de protesta
    const tutBg = this.add.graphics();
    tutBg.fillStyle(0x000000, 0.85);
    tutBg.fillRoundedRect(-400, -250, 800, 500, 30);
    tutBg.lineStyle(5, 0xffd700);
    tutBg.strokeRoundedRect(-400, -250, 800, 500, 30);
    tutorialContainer.add(tutBg);

    // Título estilo propaganda política
    const title = this.add.text(0, -230, 'MANUAL DEL BUEN POPULISTA DIGITAL', { 
      fontSize: '28px', 
      fill: '#ff2222', 
      fontFamily: 'Impact',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);
    tutorialContainer.add(title);

    // Controles con analogías políticas
    const instructions = this.add.text(-350, -180, 
      "🚗 CONTROLES DEL RELATO 🚗\n\n" +
      "◀️ ▶️  Girar la narrativa (según convenga)\n" +
      "🔼 Acelerar la máquina de fake news\n" +
      "🔽 Frenar la oposición\n" +
      "💥 Botón de crisis: Crear cortina de humo\n\n" +
      "🎯 OBJETIVO HEGEMÓNICO:\n" +
      "• Reducir la SALUD DEMOCRÁTICA de 100 a 0\n" +
      "• Mantener tu POPULARIDAD arriba con memes\n\n" +
      "⚠️ PELIGROS EN LA PISTA:\n" +
      "• Periodistas independientes (restan 20% de relato)\n" +
      "• Datos de inflación reales (daño crítico)\n" +
      "• Audios filtrados (¡congelan tu cuenta 5 segundos!)\n\n" +
      "💎 POWER-UPS DEL SISTEMA:\n" +
      "• Dolarización mágica (+50 credibilidad)\n" +
      "• Alianza con influencers (+30 velocidad)\n" +
      "• Victimización (escudo temporal)",
      { 
        fontSize: '16px', 
        fill: '#fff', 
        wordWrap: { width: 750 },
        lineSpacing: 6
      }
    );
    tutorialContainer.add(instructions);

    // Indicador estilo "Estado de la Nación"
    const economyMeter = this.add.graphics()
      .fillStyle(0x00ff00, 1)
      .fillRect(-100, 190, 200, 15)
      .lineStyle(2, 0xffffff)
      .strokeRect(-100, 190, 200, 15);
    tutorialContainer.add(economyMeter);
    const economyText = this.add.text(0, 175, 'ESTABILIDAD ECONÓMICA', {
      fontSize: '14px',
      fill: '#ffff00'
    }).setOrigin(0.5);
    tutorialContainer.add(economyText);

    // Botón estilo llamado a la acción política
    const startBtn = this.add.text(0, 220, '[ DECRETAR EMERGENCIA Y COMENZAR ]', {
      fontSize: '22px',
      fill: '#00ff00',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true })
      .on('pointerover', () => startBtn.setScale(1.1))
      .on('pointerout', () => startBtn.setScale(1))
      .on('pointerdown', () => {
        this.sound.play('menuSelect');
        this.scene.start('GameScene');
      });
    tutorialContainer.add(startBtn);

    // Efectos adicionales
    this.add.text(50, 50, "VERSIÓN BETA\n(sujeta a ajustes)", {
      fontSize: '18px',
      fill: '#ff0000',
      rotation: -0.2
    });
    
    // Animación de "recorte presupuestario" en el medidor
    this.tweens.add({
      targets: economyMeter,
      scaleX: 0.3,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
}
