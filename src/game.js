// Definición de constantes para tamaños
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

/* ---------------- BootScene: carga de assets ---------------- */
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    // Imágenes
    this.load.image('menuBg', 'assets/images/menu_background.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('trackBg', 'assets/images/track_background.png');
    this.load.image('playerKart', 'assets/images/milei_kart.png');
    this.load.image('opponentKart', 'assets/images/opponent_kart.png');
    this.load.image('powerDesinfo', 'assets/images/power_up_desinformation.png');
    this.load.image('powerRetuits', 'assets/images/power_up_retuits.png');
    this.load.image('powerShield', 'assets/images/power_up_shield.png');
    this.load.image('powerHostigamiento', 'assets/images/power_up_hostigamiento.png');
    // Sonidos
    this.load.audio('bgMusic', 'assets/sounds/background_music.mp3');
    this.load.audio('itemPickup', 'assets/sounds/item_pickup.wav');
    this.load.audio('attackSound', 'assets/sounds/attack_sound.wav');
    this.load.audio('collisionSound', 'assets/sounds/collision_sound.wav');
    this.load.audio('menuSelect', 'assets/sounds/menu_select.wav');
  }
  create() {
    this.scene.start('IntroScene');
  }
}

/* ---------------- IntroScene: contexto e introducción ---------------- */
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }
  create() {
    // Fondo de introducción
    const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    
    // Contenedor para el texto de introducción
    const introContainer = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
    // Fondo semi-transparente para mejorar legibilidad
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.6);
    graphics.fillRoundedRect(-350, -200, 700, 400, 20);
    introContainer.add(graphics);
    
    const introText = this.add.text(0, -150,
      "Contexto:\n\n" +
      "Milei está manipulando la opinión pública para ganarse el apoyo de sus votantes. " +
      "Sus estrategias poco convencionales se representan en este juego. \n\n" +
      "Además, se encuentra envuelto en un escándalo por promocionar una estafa cripto, " +
      "y el futuro económico del país es incierto.",
      { fontSize: '16px', fill: '#fff', align: 'center', wordWrap: { width: 650 } }
    ).setOrigin(0.5);
    introContainer.add(introText);
    
    const continueText = this.add.text(0, 150, 'Continuar', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5);
    continueText.setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    introContainer.add(continueText);
  }
}

/* ---------------- MenuScene: pantalla principal ---------------- */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    // Fondo
    const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    
    // Contenedor del menú
    const menuContainer = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
    
    // Logo del juego (más chico y ubicado en la parte superior central)
    const logo = this.add.image(0, -180, 'logo').setScale(0.3);
    
    // Botón "Jugar"
    const playBtn = this.add.text(0, -20, 'Jugar', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    playBtn.setInteractive({ useHandCursor: true });
    playBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('TutorialScene');
    });
    
    // Botón "Tutorial"
    const tutBtn = this.add.text(0, 40, 'Tutorial', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    tutBtn.setInteractive({ useHandCursor: true });
    tutBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('TutorialScene');
    });
    
    menuContainer.add([logo, playBtn, tutBtn]);
  }
}

/* ---------------- TutorialScene: instrucciones con fondo ---------------- */
class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }
  create() {
    // Fondo del tutorial
    const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    
    // Contenedor del tutorial
    const tutorialContainer = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
    // Fondo semi-transparente para el texto
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRoundedRect(-350, -200, 700, 400, 20);
    tutorialContainer.add(graphics);
    
    const title = this.add.text(0, -180, 'Tutorial', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    
    const instructions = 
      "Controles:\n" +
      "Flechas: Mover\n" +
      "Botón ATAQUE: Activar ataque\n\n" +
      "Power-ups:\n" +
      "- Gasolina de Desinformación: Acelera y confunde\n" +
      "- Bombas de Retuits: Detienen rivales\n" +
      "- Escudo de Privilegio: Protección temporal\n" +
      "- Chispas de Hostigamiento: Ataque directo\n\n" +
      "Recoge power-ups para sumar puntos y evita colisiones con los adversarios.";
    
    const instrText = this.add.text(0, -60, instructions, { fontSize: '16px', fill: '#fff', align: 'center', wordWrap: { width: 650 } }).setOrigin(0.5);
    
    const startBtn = this.add.text(0, 150, 'Empezar Carrera', { fontSize: '28px', fill: '#0f0' }).setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('GameScene');
    });
    
    tutorialContainer.add([title, instrText, startBtn]);
  }
}

/* ---------------- GameScene: mecánica mejorada con controles en pantalla ---------------- */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    // Variables para controles virtuales
    this.controlLeft = false;
    this.controlRight = false;
    this.controlUp = false;
    this.controlAttack = false;
  }
  create() {
    // Música de fondo
    this.bgMusic = this.sound.add('bgMusic', { volume: 0.4, loop: true });
    this.bgMusic.play();
    
    // Fondo de la pista
    this.track = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'trackBg').setOrigin(0);
    
    // Jugador: se crea directamente, con menor escala para mayor movilidad
    this.player = this.physics.add.sprite(GAME_WIDTH/2, GAME_HEIGHT - 60, 'playerKart').setScale(0.4);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);
    this.player.setMaxVelocity(200);
    
    // Oponente simple
    this.opponent = this.physics.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, 'opponentKart').setScale(0.4);
    this.opponent.setCollideWorldBounds(true);
    this.opponent.setVelocityX(100);
    
    // HUD
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', { fontSize: '24px', fill: '#fff' });
    
    // Grupo para power-ups
    this.powerUps = this.physics.add.group();
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });
    
    // Colisiones
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    this.physics.add.collider(this.player, this.opponent, this.handleCollision, null, this);
    
    // Controles de teclado (para complementar)
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // --- Controles Virtuales ---
    // Creación de botones en pantalla (usando textos con fondo)
    // Botón Izquierda
    this.btnLeft = this.add.rectangle(70, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3).setScrollFactor(0);
    const leftText = this.add.text(70, GAME_HEIGHT - 70, '←', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setScrollFactor(0);
    this.btnLeft.setInteractive();
    this.btnLeft.on('pointerdown', () => { this.controlLeft = true; });
    this.btnLeft.on('pointerup', () => { this.controlLeft = false; });
    this.btnLeft.on('pointerout', () => { this.controlLeft = false; });
    
    // Botón Derecha
    this.btnRight = this.add.rectangle(140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3).setScrollFactor(0);
    const rightText = this.add.text(140, GAME_HEIGHT - 70, '→', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setScrollFactor(0);
    this.btnRight.setInteractive();
    this.btnRight.on('pointerdown', () => { this.controlRight = true; });
    this.btnRight.on('pointerup', () => { this.controlRight = false; });
    this.btnRight.on('pointerout', () => { this.controlRight = false; });
    
    // Botón Arriba (acelerar)
    this.btnUp = this.add.rectangle(GAME_WIDTH - 140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3).setScrollFactor(0);
    const upText = this.add.text(GAME_WIDTH - 140, GAME_HEIGHT - 70, '↑', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setScrollFactor(0);
    this.btnUp.setInteractive();
    this.btnUp.on('pointerdown', () => { this.controlUp = true; });
    this.btnUp.on('pointerup', () => { this.controlUp = false; });
    this.btnUp.on('pointerout', () => { this.controlUp = false; });
    
    // Botón Ataque
    this.btnAttack = this.add.rectangle(GAME_WIDTH - 70, GAME_HEIGHT - 70, 70, 70, 0xff0000, 0.4).setScrollFactor(0);
    const attackText = this.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 70, 'ATAQUE', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5).setScrollFactor(0);
    this.btnAttack.setInteractive();
    this.btnAttack.on('pointerdown', () => { 
      this.controlAttack = true; 
      this.activateAttack();
    });
    this.btnAttack.on('pointerup', () => { this.controlAttack = false; });
    this.btnAttack.on('pointerout', () => { this.controlAttack = false; });
    
    // Carrera: 60 segundos
    this.time.delayedCall(60000, () => {
      this.bgMusic.stop();
      this.scene.start('EndScene', { score: this.score });
    }, [], this);
  }
  
  update() {
    // Desplazamiento del fondo
    this.track.tilePositionY -= 2;
    
    // Controles de teclado
    if (this.cursors.left.isDown) { this.player.angle -= 2; }
    if (this.cursors.right.isDown) { this.player.angle += 2; }
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(Phaser.Math.DegToRad(this.player.angle - 90), 200, this.player.body.acceleration);
    } else {
      this.player.setAcceleration(0);
    }
    
    // Controles virtuales
    if (this.controlLeft) { this.player.angle -= 2; }
    if (this.controlRight) { this.player.angle += 2; }
    if (this.controlUp) {
      this.physics.velocityFromRotation(Phaser.Math.DegToRad(this.player.angle - 90), 200, this.player.body.acceleration);
    }
  }
  
  spawnPowerUp() {
    const types = ['powerDesinfo', 'powerRetuits', 'powerShield', 'powerHostigamiento'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const powerUp = this.physics.add.sprite(x, 0, type).setScale(0.5);
    powerUp.setVelocityY(Phaser.Math.Between(50, 150));
    powerUp.type = type;
    this.powerUps.add(powerUp);
  }
  
  collectPowerUp(player, powerUp) {
    this.sound.play('itemPickup');
    let points = 10;
    if (powerUp.type === 'powerDesinfo') points = 15;
    else if (powerUp.type === 'powerRetuits') points = 20;
    else if (powerUp.type === 'powerShield') points = 25;
    else if (powerUp.type === 'powerHostigamiento') points = 30;
    this.score += points;
    this.scoreText.setText('Puntos: ' + this.score);
    powerUp.destroy();
  }
  
  handleCollision(player, opponent) {
    this.sound.play('collisionSound');
    this.score = Math.max(0, this.score - 10);
    this.scoreText.setText('Puntos: ' + this.score);
  }
  
  // Función para el botón de ataque: en este ejemplo, al usar ataque se reproducirá un sonido y se sumarán puntos extra.
  activateAttack() {
    this.sound.play('attackSound');
    // Simula un ataque: se incrementa la velocidad temporalmente y se suman puntos extra
    this.player.setTint(0xff9999);
    this.time.delayedCall(500, () => {
      this.player.clearTint();
    }, [], this);
    this.score += 5;
    this.scoreText.setText('Puntos: ' + this.score);
  }
}

/* ---------------- EndScene: pantalla final ---------------- */
class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }
  init(data) {
    this.finalScore = data.score;
  }
  create() {
    // Fondo final
    const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    
    // Contenedor final
    const endContainer = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
    const endText = this.add.text(0, -50, '¡Carrera Terminada!', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
    const scoreText = this.add.text(0, 0, 'Puntuación: ' + this.finalScore, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    const menuBtn = this.add.text(0, 80, 'Volver al Menú', { fontSize: '28px', fill: '#0f0' }).setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    endContainer.add([endText, scoreText, menuBtn]);
  }
}

/* ---------------- Configuración del juego ---------------- */
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, IntroScene, MenuScene, TutorialScene, GameScene, EndScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
