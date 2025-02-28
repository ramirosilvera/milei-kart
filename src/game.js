// Escena de precarga (BootScene)
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
        // Una vez cargados los assets, se inicia el menú
        this.scene.start('MenuScene');
    }
}

// Escena del menú principal (MenuScene)
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    create() {
        // Fondo del menú
        this.add.image(400, 300, 'menuBg');
        // Logotipo del juego
        this.add.image(400, 150, 'logo');
        // Botón de "Jugar"
        const startText = this.add.text(400, 400, 'Jugar', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        startText.setInteractive();
        startText.on('pointerdown', () => {
            this.sound.play('menuSelect');
            this.scene.start('GameScene');
        });
    }
}

// Escena principal del juego (GameScene)
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    create() {
        // Inicia la música de fondo
        this.bgMusic = this.sound.add('bgMusic', { volume: 0.5, loop: true });
        this.bgMusic.play();

        // Fondo de la pista: se usa un tile sprite para dar efecto de desplazamiento
        this.track = this.add.tileSprite(400, 300, 800, 600, 'trackBg');

        // Crea el kart del jugador
        this.player = this.physics.add.sprite(400, 500, 'playerKart');
        this.player.setCollideWorldBounds(true);
        this.player.setDamping(true);
        this.player.setDrag(0.99);
        this.player.setMaxVelocity(200);

        // Crea un oponente simple que se mueve horizontalmente
        this.opponent = this.physics.add.sprite(400, 300, 'opponentKart');
        this.opponent.setCollideWorldBounds(true);
        this.opponent.setVelocityX(100);

        // Se configuran los controles con las teclas de flechas
        this.cursors = this.input.keyboard.createCursorKeys();

        // Grupo para los power-ups
        this.powerUps = this.physics.add.group();

        // Evento para generar power-ups cada 3 segundos
        this.time.addEvent({
            delay: 3000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        // Colisión entre el jugador y los power-ups
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // Colisión entre el jugador y el oponente
        this.physics.add.collider(this.player, this.opponent, this.handleCollision, null, this);

        // Variable de puntuación y su visualización
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '24px', fill: '#fff' });

        // Simulación de duración de la carrera: 60 segundos
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
            this.player.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
            this.player.setAngularVelocity(150);
        } else {
            this.player.setAngularVelocity(0);
        }
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, 200, this.player.body.acceleration);
        } else {
            this.player.setAcceleration(0);
        }

        // Movimiento simple del oponente: rebota en los límites horizontales
        if (this.opponent.body.blocked.right || this.opponent.x >= 750) {
            this.opponent.setVelocityX(-100);
        } else if (this.opponent.body.blocked.left || this.opponent.x <= 50) {
            this.opponent.setVelocityX(100);
        }
    }

    spawnPowerUp() {
        // Selecciona aleatoriamente un tipo de power-up
        const types = ['powerDesinfo', 'powerRetuits', 'powerShield', 'powerHostigamiento'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const x = Phaser.Math.Between(50, 750);
        const powerUp = this.physics.add.sprite(x, 0, type);
        powerUp.setVelocityY(Phaser.Math.Between(50, 150));
        powerUp.type = type;
        this.powerUps.add(powerUp);
    }

    collectPowerUp(player, powerUp) {
        this.sound.play('itemPickup');
        // Suma puntos según el tipo de power-up
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
        // Resta puntos al chocar con el oponente
        this.score = Math.max(0, this.score - 10);
        this.scoreText.setText('Puntos: ' + this.score);
    }
}

// Escena final (EndScene)
class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }
    init(data) {
        this.finalScore = data.score;
    }
    create() {
        this.add.text(400, 250, '¡Carrera terminada!', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 320, 'Puntuación: ' + this.finalScore, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        const restartText = this.add.text(400, 400, 'Volver al Menú', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        restartText.setInteractive();
        restartText.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, EndScene]
};

const game = new Phaser.Game(config);
