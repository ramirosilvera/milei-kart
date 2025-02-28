class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Fondo con estilo de "canal de noticias" sensacionalista
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    
    // Efecto de overlays de "noticiero" (requeriría assets adicionales)
    const newsBanner = this.add.image(GAME_WIDTH/2, 50, 'breakingNewsBanner').setOrigin(0.5);
    const ticker = this.add.text(0, GAME_HEIGHT - 30, 'ÚLTIMO MOMENTO: El dólar crypto deja de ser meme | Confirman alianza con YouTuber polémico | Los perros dejan de ladrar: ¿Se viene el caos?', 
      { fontSize: '18px', fill: '#ff0000', backgroundColor: '#ffff00' }).setOrigin(0);
    this.tweens.add({ targets: ticker, x: -2000, duration: 20000, repeat: -1 });

    const introContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo estilo panel de debate televisivo
    const introBg = this.add.graphics();
    introBg.fillStyle(0x1a237e, 0.9); // Azul oscuro similar a canales de noticias
    introBg.fillRoundedRect(-350, -200, 700, 400, 20);
    introContainer.add(introBg);

    // Texto con estilo de chyron de noticiero
    const introText = this.add.text(0, -150,
      "🚨¡ALERTA DEMOCRÁTICA!🚨\n" + 
      "🔥MILEI KART: LA PISTA DEL RELATO🔥\n\n" +
      "En un país donde la inflación corre más que un karting, Javier Milei transforma\n" + 
      "la política en un reality show. ¿Su arma secreta? ¡El triple discurso:\n" +
      "1️⃣ Lágrimas en TV ✨ 2️⃣ Tuits explosivos 💣 3️⃣ Economía de meme coin �\n\n" +
      "📢 ÚLTIMO ESCÁNDALO: 'Coin B' - ¿El dogecoin argentino?\n" +
      "💸 Votantes convertidos en hodlers: ¡El pump & dump de la historia!\n\n" +
      "⚠️ ADVERTENCIA: Contienes:\n" +
      "- Dosis letales de posverdad\n" + 
      "- Conflictos de interés con youtubers\n" +
      - "Espejos de la economía: ¡Reflejan más deuda que soluciones!\n\n" +
      "¿Podrás esquivar los fake news boosters y destapar la 💼CAJA PANDORA💼\n" +
      "antes que el país se convierta en un DLC de ajuste eterno?",
      { 
        fontSize: '16px', 
        fill: '#fff', 
        align: 'center', 
        fontStyle: 'bold',
        wordWrap: { width: 650 },
        lineSpacing: 5
      }
    ).setOrigin(0.5);
    introContainer.add(introText);

    // Botón estilo "ACEPTAR LAS CONDICIONES DEL FMI"
    const continueText = this.add.text(0, 160, '[🖱️ FIRMAR AJUSTE PARA CONTINUAR]', 
      { 
        fontSize: '20px', 
        fill: '#ff5555', 
        fontStyle: 'italic',
        backgroundColor: '#000000'
      }
    ).setOrigin(0.5);
    continueText.setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    introContainer.add(continueText);

    // Elemento adicional: "Publicidad" irónica
    const adText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 100,
      "PATROCINADO POR:\nCRYPTO ESTATAL\n'La moneda que nunca devalúa'\n(mentira)",
      { fontSize: '14px', fill: '#ffff00', align: 'right' }
    ).setOrigin(1,0);
    this.tweens.add({ targets: adText, alpha: 0.3, duration: 1000, yoyo: true, repeat: -1 });
  }
}
