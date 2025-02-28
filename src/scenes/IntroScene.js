class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor principal
    const introContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo del diálogo
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x000000, 0.7);
    dialogBg.fillRoundedRect(-300, -150, 600, 300, 15);
    introContainer.add(dialogBg);

    // Texto introductorio
    const introText = this.add.text(0, -80,
      "MILEI KART: LA GRAN ESTAMPIDA\n\n" +
      "En la pista donde las promesas chocan con la inflación,\n" +
      "deberás esquivar:\n" +
      "• Criptoestafas disfrazadas de libertad\n" +
      "• Recortes presupuestarios express\n" +
      "• Batallas culturales en curva cerrada\n\n" +
      "[ ¿Podrás cruzar la meta sin perder el sentido común? ]",
      { 
        fontSize: '18px', 
        fill: '#FFF', 
        align: 'center', 
        wordWrap: { width: 550 },
        lineSpacing: 6
      }
    ).setOrigin(0.5);
    introContainer.add(introText);

    // Botón funcional (versión corregida)
    const continueButton = this.add.text(0, 100, 'ACEPTAR DECRETAZO', {
      fontSize: '22px',
      fill: '#FF2222',
      fontStyle: 'bold',
      backgroundColor: '#FFFFFF20',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    // Configuración interactiva CORRECTA
    continueButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, continueButton.width, continueButton.height), Phaser.Geom.Rectangle.Contains);
    continueButton.on('pointerover', () => continueButton.setAlpha(0.8));
    continueButton.on('pointerout', () => continueButton.setAlpha(1));
    continueButton.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    
    introContainer.add(continueButton);
  }
}