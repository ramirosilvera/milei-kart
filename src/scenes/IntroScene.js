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

    // Texto de introducción actualizado
    const introText = this.add.text(0, -150,
      "¡ALERTA MILEIKART: LA CARRERA DEL RELATO!\n\n" +
      "🔥 ¿Qué pasa cuando un 'anarcocapitalista' hereda el país con inflación galopante y un FMI en modo acoso?\n\n" +
      "📢 En este delirante hypergame descubrirás:\n" +
      "- Cómo convertir memes en política pública\n" +
      "- La fórmula mágica: ¡Bajar la inflación con recortes de TikTok!\n" +
      "- El mega-escándalo DólarCoin: ¿Estafa cripto o 'libertad financiera'? 🚨\n\n" +
      "⚠️ ADVERTENCIA: Contiene:\n" +
      "- Dosis letales de retórica libertaria\n" +
      - "Privatizaciones express (¡hasta tu abuela en Marketplace!)\n" +
      "- Batallas campales contra 'la casta' (que ahora incluye hasta al fantasma de Perón)\n\n" +
      "¿Podrás esquivar la hiperinflación, los cuadernazos oligarcas y llegar primero al ajuste estructural?\n\n" +
      "¡ESTO NO ES UN JUEGO! (Bueno, sí... pero con datos reales de la balanza comercial)",
      { 
        fontSize: '16px', 
        fill: '#fff', 
        align: 'center', 
        wordWrap: { width: 650 },
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Efectos de texto
    const palabrasClave = ["DólarCoin", "FMI", "casta", "hiperinflación"];
    palabrasClave.forEach(palabra => {
      introText.setStyle({ color: '#ff5555' }, palabra);
    });

    introContainer.add(introText);

    // Botón con texto irónico
    const continueText = this.add.text(0, 150, 'Aceptar Shock Fiscal para Continuar →', 
      { 
        fontSize: '20px', 
        fill: '#ff0000',
        fontStyle: 'italic',
        backgroundColor: '#ffffff30'
      }
    ).setOrigin(0.5);
    
    continueText.setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    introContainer.add(continueText);

    // Texto legal satírico
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 30,
      "*Este juego no endosa ni recibe dólar blue. Consulte a su economista de cabecera. Advertencia BCRA: Incluye chistes de oferta y demanda.",
      {
        fontSize: '12px',
        fill: '#888',
        align: 'center'
      }
    ).setOrigin(0.5);
  }
}