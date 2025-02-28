class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor para la narrativa
    const introContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo semitransparente
    const introBg = this.add.graphics();
    introBg.fillStyle(0x000000, 0.6);
    introBg.fillRoundedRect(-350, -200, 700, 400, 20);
    introContainer.add(introBg);

    // Texto de introducción
    const introText = this.add.text(0, -150,
      "MILEI KART: LA PISTA DEL RELATO\n\n" +
      "En un país donde la inflación corre más que los autos,\n" +
      "te presentamos el juego donde las promesas de campaña\n" +
      "chocan contra la realidad económica.\n\n" +
      "▸ Domina el arte de convertir memes en política pública\n" +
      "▸ Esquiva el FMI y las criptoestafas 'libertarias'\n" +
      "▸ Supera a la 'casta'... aunque hoy seas parte de ella\n\n" +
      "¿Podrás llegar a la meta sin devaluar el sentido común?",
      { 
        fontSize: '18px', 
        fill: '#fff', 
        align: 'center', 
        wordWrap: { width: 600 },
        lineSpacing: 8
      }
    ).setOrigin(0.5);
    
    // Destacar términos clave
    const palabrasClave = ["inflación", "FMI", "criptoestafas", "'casta'"];
    palabrasClave.forEach(palabra => {
      introText.setStyle({ color: '#FF5555' }, palabra);
    });

    introContainer.add(introText);

    // Botón irónico minimalista
    const continueText = this.add.text(0, 150, '[ Iniciar Ajuste ]', 
      { 
        fontSize: '24px', 
        fill: '#FF4444',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    continueText.setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    introContainer.add(continueText);

    // Pie de texto satírico
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 40,
      "*Dólar no incluido - Tasas de interés sujetas al humor del mercado",
      {
        fontSize: '12px',
        fill: '#AAA',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
  }
}