// Variables globales para tamaños relativos
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

/* ----------------- BootScene: precarga de assets ----------------- */
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
        this.scene.start('MenuScene');
    }
}

/* ----------------- MenuScene: pantalla de inicio ----------------- */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    create() {
        // Fondo del menú (ajustado al tamaño del juego)
        const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        
        // Contenedor del menú
        const menuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        
        // Logotipo del juego
        const logo = this.add.image(0, -150, 'logo').setScale(0.5);
        
        // Botón "Jugar" (texto interactivo)
        const playText = this.add.text(0, 0, 'Jugar', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        playText.setInteractive({ useHandCursor: true });
        playText.on('pointerdown', () => {
            this.sound.play('menuSelect');
            // Ir directamente al juego o al tutorial (aquí vamos al tutorial)
            this.scene.start('TutorialScene');
        });
        
        // Botón "Tutorial"
        const tutorialText = this.add.text(0, 60, 'Tutorial', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        tutorialText.setInteractive({ useHandCursor: true });
        tutorialText.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.scene.start('TutorialScene');
        });
        
        // Agregamos todo al contenedor
        menuContainer.add([logo, playText, tutorialText]);
    }
}

/* ----------------- TutorialScene: instrucciones de juego ----------------- */
class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }
    create() {
        // Fondo para el tutorial (reutilizamos el fondo del menú)
        const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        
        // Contenedor de tutorial
        const tutorialContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        
        // Título del tutorial
        const title = this.add.text(0, -200, 'Tutorial', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        
        // Instrucciones (pueden ser más detalladas)
        const instructions = 
            "Controles:\n" +
            "→ ←: Girar\n" +
            "↑: Acelerar\n\n" +
            "Power-ups:\n" +
            "- Gasolina de Desinformación: Acelera y deja confusión\n" +
            "- Bombas de Retuits: Explosión que detiene rivales\n" +
            "- Escudo de Privilegio: Protección temporal\n" +
            "- Chispas de Hostigamiento: Ataque directo\n\n" +
            "Recoge power-ups para sumar puntos y evita a tus oponentes.\n\n" +
            "¡Presiona 'Empezar Carrera' para comenzar!";
        
        const instrText = this.add.text(0, -80, instructions, { fontSize: '16px', fill: '#fff', align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5);
        
        // Botón para comenzar la carrera
        const startBtn = this.add.text(0, 180, 'Empezar Carrera', { fontSize: '28px', fill: '#0f0' }).setOrigin(0.5);
        startBtn.setInteractive({ useHandCursor: true });
        startBtn.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.scene.start('GameScene');
        });
        
        tutorialContainer.add([title, instrText, startBtn]);
    }
}

/* ----------------- GameScene: mecánica de carrera ----------------- */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    create() {
        // Inicia música de fondo
        this.bgMusic = this.sound.add('bgMusic', { volume: 0.4, loop: true });
        this.bgMusic.play();

        // Fondo de la pista usando TileSprite (para efecto de desplazamiento)
        this.track = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'trackBg').setOrigin(0);

        // Contenedor para el jugador (para facilitar ajustes de escala y posición)
        this.playerContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 80);
        this.player = this.physics.add.sprite(0, 0, 'playerKart');
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.playerContainer.add(this.player);

        // Oponente simple
        this.opponent = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'opponentKart');
        this.opponent.setScale(0.5);
        this.opponent.setCollideWorldBounds(true);
        this.opponent.setVelocityX(100);

        // Contenedor del HUD
        this.hudContainer = this.add.container(10, 10);
        this.score = 0;
        this.scoreText = this.add.text(0, 0, 'Puntos: 0', { fontSize: '24px', fill: '#fff' });
        this.hudContainer.add(this.scoreText);

        // Grupo para power-ups
        this.powerUps = this.physics.add.group();

        // Evento de generación de power-ups cada 3 segundos
        this.time.addEvent({
            delay: 3000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Colisiones: jugador con power-ups y con oponente
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
        this.physics.add.collider(this.player, this.opponent, this.handleCollision, null, this);

        // Carrera de 60 segundos
        this.time.delayedCall(60000, () => {
            this.bgMusic.stop();
            this.scene.start('EndScene', { score: this.score });
        }, [], this);
    }

    update() {
        // Desplaza el fondo para simular movimiento
        this.track.tilePositionY -= 2;

        // Movimiento del jugador
        if (this.cursors.left.isDown) {
            this.player.angle -= 2;
        } else if (this.cursors.right.isDown) {
            this.player.angle += 2;
        }
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(Phaser.Math.DegToRad(this.player.angle - 90), 200, this.player.body.acceleration);
        } else {
            this.player.setAcceleration(0);
        }

        // Movimiento simple del oponente: rebota horizontalmente
        if (this.opponent.x >= GAME_WIDTH - 50) {
            this.opponent.setVelocityX(-100);
        } else if (this.opponent.x <= 50) {
            this.opponent.setVelocityX(100);
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
}

/* ----------------- EndScene: pantalla final ----------------- */
class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }
    init(data) {
        this.finalScore = data.score;
    }
    create() {
        // Fondo de la pantalla final
        const bg = this.add.image(0, 0, 'menuBg').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        
        // Contenedor para elementos finales
        const endContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
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

/* ----------------- Configuración del juego ----------------- */
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, MenuScene, TutorialScene, GameScene, EndScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
