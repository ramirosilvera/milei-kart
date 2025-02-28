/* ---------------------------
   Constantes de configuración
---------------------------- */
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

/* -----------
   BootScene
------------ */
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    // Carga de imágenes
    this.load.image('menuBg', 'assets/images/menu_background.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('trackBg', 'assets/images/track_background.png');
    this.load.image('playerKart', 'assets/images/milei_kart.png');
    this.load.image('opponentKart', 'assets/images/opponent_kart.png');
    this.load.image('powerDesinfo', 'assets/images/power_up_desinformation.png');
    this.load.image('powerRetuits', 'assets/images/power_up_retuits.png');
    this.load.image('powerShield', 'assets/images/power_up_shield.png');
    this.load.image('powerHostigamiento', 'assets/images/power_up_hostigamiento.png');

    // Carga de sonidos
    this.load.audio('bgMusic', 'assets/sounds/background_music.mp3');
    this.load.audio('itemPickup', 'assets/sounds/item_pickup.wav');
    this.load.audio('attackSound', 'assets/sounds/attack_sound.wav');
    this.load.audio('collisionSound', 'assets/sounds/collision_sound.wav');
    this.load.audio('menuSelect', 'assets/sounds/menu_select.wav');
  }
  create() {
    // Al terminar la precarga, vamos a la IntroScene
    this.scene.start('IntroScene');
  }
}

/* -----------
   IntroScene
   (Contexto e introducción)
------------ */
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }
  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor para el texto de introducción
    const introContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo semitransparente para mejorar la legibilidad
    const introBg = this.add.graphics();
    introBg.fillStyle(0x000000, 0.6);
    introBg.fillRoundedRect(-350, -200, 700, 400, 20);
    introContainer.add(introBg);

    // Texto de introducción
    const introText = this.add.text(0, -150,
      "Milei Kart: Carrera Manipuladora\n\n" +
      "Milei está manipulando la opinión pública para ganarse el apoyo de sus votantes. " +
      "Sus estrategias se reflejan en este juego. Además, se ve envuelto en un escándalo por " +
      "promocionar una estafa cripto, dejando el futuro económico del país en la incertidumbre.\n\n" +
      "¿Lograrás sortear sus maniobras y alcanzar la victoria?",
      { 
        fontSize: '16px', 
        fill: '#fff', 
        align: 'center', 
        wordWrap: { width: 650 } 
      }
    ).setOrigin(0.5);
    introContainer.add(introText);

    // Botón para continuar
    const continueText = this.add.text(0, 120, 'Continuar', 
      { fontSize: '24px', fill: '#0f0' }
    ).setOrigin(0.5);
    continueText.setInteractive({ useHandCursor: true });
    continueText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('MenuScene');
    });
    introContainer.add(continueText);
  }
}

/* -----------
   MenuScene
   (Pantalla principal)
------------ */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor de menú
    const menuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Logo (tamaño reducido, posicionado arriba)
    const logo = this.add.image(0, -180, 'logo').setScale(0.3);

    // Botón Jugar
    const playBtn = this.add.text(0, -20, 'Jugar', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);
    playBtn.setInteractive({ useHandCursor: true });
    playBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('TutorialScene');
    });

    // Botón Tutorial
    const tutBtn = this.add.text(0, 40, 'Tutorial', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);
    tutBtn.setInteractive({ useHandCursor: true });
    tutBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('TutorialScene');
    });

    menuContainer.add([logo, playBtn, tutBtn]);
  }
}

/* -----------
   TutorialScene
   (Instrucciones con fondo)
------------ */
class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }
  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor tutorial
    const tutorialContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Fondo semitransparente
    const tutBg = this.add.graphics();
    tutBg.fillStyle(0x000000, 0.7);
    tutBg.fillRoundedRect(-350, -200, 700, 400, 20);
    tutorialContainer.add(tutBg);

    // Título
    const title = this.add.text(0, -170, 'Tutorial', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);

    // Texto de instrucciones
    const instructions =
      "Controles:\n" +
      "Flechas: Mover\n" +
      "Botón ATAQUE: Realizar ataque\n\n" +
      "Power-ups:\n" +
      "- Gasolina de Desinformación: Acelera y confunde\n" +
      "- Bombas de Retuits: Detienen rivales\n" +
      "- Escudo de Privilegio: Protección temporal\n" +
      "- Chispas de Hostigamiento: Ataque directo\n\n" +
      "Suma puntos recogiendo power-ups y usando ataques.\n" +
      "¡Evita chocar y mantén tu ventaja!";

    const instrText = this.add.text(0, -40, instructions, 
      { fontSize: '16px', fill: '#fff', align: 'center', wordWrap: { width: 650 } }
    ).setOrigin(0.5);

    // Botón para iniciar carrera
    const startBtn = this.add.text(0, 140, 'Empezar Carrera', 
      { fontSize: '28px', fill: '#0f0' }
    ).setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.start('GameScene');
    });

    tutorialContainer.add([title, instrText, startBtn]);
  }
}

/* -----------
   GameScene
   (Mecánica del juego)
------------ */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
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

    // Jugador: sprite más pequeño para mayor movilidad
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'playerKart').setScale(0.4);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);
    this.player.setMaxVelocity(200);

    // Oponente
    this.opponent = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'opponentKart').setScale(0.4);
    this.opponent.setCollideWorldBounds(true);
    this.opponent.setVelocityX(100);

    // HUD
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', 
      { fontSize: '24px', fill: '#fff' }
    );

    // Grupo de power-ups
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

    // Controles de teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Controles en pantalla (flechas y ataque)
    this.createVirtualControls();

    // Duración de la carrera
    this.time.delayedCall(60000, () => {
      this.bgMusic.stop();
      this.scene.start('EndScene', { score: this.score });
    }, [], this);
  }

  update() {
    // Mueve el fondo para dar sensación de avance
    this.track.tilePositionY -= 2;

    // Controles de teclado
    if (this.cursors.left.isDown) { this.player.angle -= 2; }
    if (this.cursors.right.isDown) { this.player.angle += 2; }
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90), 
        200, 
        this.player.body.acceleration
      );
    } else {
      this.player.setAcceleration(0);
    }

    // Controles virtuales
    if (this.controlLeft)  { this.player.angle -= 2; }
    if (this.controlRight) { this.player.angle += 2; }
    if (this.controlUp) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90), 
        200, 
        this.player.body.acceleration
      );
    }
  }

  createVirtualControls() {
    // Botón Izquierda
    const btnLeft = this.add.rectangle(70, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3);
    btnLeft.setOrigin(0.5).setScrollFactor(0);
    this.add.text(70, GAME_HEIGHT - 70, '←', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnLeft.setInteractive();
    btnLeft.on('pointerdown', () => { this.controlLeft = true; });
    btnLeft.on('pointerup', () => { this.controlLeft = false; });
    btnLeft.on('pointerout', () => { this.controlLeft = false; });

    // Botón Derecha
    const btnRight = this.add.rectangle(140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3);
    btnRight.setOrigin(0.5).setScrollFactor(0);
    this.add.text(140, GAME_HEIGHT - 70, '→', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnRight.setInteractive();
    btnRight.on('pointerdown', () => { this.controlRight = true; });
    btnRight.on('pointerup', () => { this.controlRight = false; });
    btnRight.on('pointerout', () => { this.controlRight = false; });

    // Botón Arriba (Acelerar)
    const btnUp = this.add.rectangle(GAME_WIDTH - 140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3);
    btnUp.setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 140, GAME_HEIGHT - 70, '↑', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnUp.setInteractive();
    btnUp.on('pointerdown', () => { this.controlUp = true; });
    btnUp.on('pointerup', () => { this.controlUp = false; });
    btnUp.on('pointerout', () => { this.controlUp = false; });

    // Botón de Ataque
    const btnAttack = this.add.rectangle(GAME_WIDTH - 70, GAME_HEIGHT - 70, 70, 70, 0xff0000, 0.4);
    btnAttack.setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 70, 'ATAQUE', 
      { fontSize: '16px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnAttack.setInteractive();
    btnAttack.on('pointerdown', () => { 
      this.controlAttack = true;
      this.activateAttack();
    });
    btnAttack.on('pointerup', () => { this.controlAttack = false; });
    btnAttack.on('pointerout', () => { this.controlAttack = false; });
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
    if (powerUp.type === 'powerDesinfo')      points = 15;
    else if (powerUp.type === 'powerRetuits') points = 20;
    else if (powerUp.type === 'powerShield')  points = 25;
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

  activateAttack() {
    // Ejemplo: sumar puntos + reproducir sonido
    this.sound.play('attackSound');
    this.player.setTint(0xff9999);

    this.time.delayedCall(300, () => {
      this.player.clearTint();
    }, [], this);

    this.score += 5;
    this.scoreText.setText('Puntos: ' + this.score);
  }
}

/* -----------
   EndScene
   (Pantalla final)
------------ */
class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }
  init(data) {
    this.finalScore = data.score;
  }
  create() {
    // Fondo
    this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Contenedor final
    const endContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const endText = this.add.text(0, -50, '¡Carrera Terminada!', 
      { fontSize: '40px', fill: '#fff' }
    ).setOrigin(0.5);

    const scoreText = this.add.text(0, 0, 'Puntuación: ' + this.finalScore, 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);

    const menuBtn = this.add.text(0, 80, 'Volver al Menú', 
      { fontSize: '28px', fill: '#0f0' }
    ).setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    endContainer.add([endText, scoreText, menuBtn]);
  }
}

/* -----------
   Config
------------ */
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
