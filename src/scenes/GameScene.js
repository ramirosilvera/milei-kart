export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 1. Configuración inicial
        this.setupScene();
        this.setupPhysics();
        this.createGameObjects();
        this.setupEventListeners();
        this.setupControls();
        this.setupTimers();
    }

    setupScene() {
        // Fondo y música
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'track')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // Estado del juego
        this.gameState = {
            playerHealth: 100,
            opponentHealth: 100,
            attackCooldown: false,
            collectedPowerUp: null,
            playerInvulnerable: false,
            opponentInvulnerable: false
        };
    }

    setupPhysics() {
        // 2. Configuración física
        this.player = this.physics.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            'mileiKart'
        )
        .setScale(0.1)
        .setCollideWorldBounds(true)
        .setDrag(600, 600)
        .setMaxVelocity(300);

        this.opponent = this.physics.add.sprite(
            this.cameras.main.centerX,
            100,
            'opponentKart'
        )
        .setScale(0.1)
        .setBounce(1, 0)
        .setCollideWorldBounds(true)
        .setVelocityX(100);

        // Grupos de objetos
        this.powerUps = this.physics.add.group();
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();
    }

    createGameObjects() {
        // 3. Elementos del juego
        this.powerUpIcon = null;
        this.scene.launch("UIScene");
    }

    setupEventListeners() {
        // 4. Colisiones
        this.physics.add.overlap(
            this.playerBullets,
            this.opponent,
            (bullet, opponent) => this.handleHit(bullet, opponent, 'opponent'),
            null,
            this
        );

        this.physics.add.overlap(
            this.opponentBullets,
            this.player,
            (bullet, player) => this.handleHit(bullet, player, 'player'),
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.powerUps,
            (player, powerUp) => this.collectPowerUp(powerUp),
            null,
            this
        );
    }

    setupControls() {
        // 5. Controles táctiles mejorados
        const createButton = (x, y, text, action) => {
            const btn = this.add.rectangle(x, y, 60, 60, 0x333333, 0.8)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive()
                .on('pointerdown', () => this[action] = true)
                .on('pointerup', () => this[action] = false)
                .on('pointerout', () => this[action] = false);
            
            this.add.text(x, y, text, { fontSize: '24px', fill: '#fff' })
                .setOrigin(0.5);
        };

        // Botones direccionales
        createButton(80, this.cameras.main.height - 180, '←', 'moveLeft');
        createButton(160, this.cameras.main.height - 100, '→', 'moveRight');
        createButton(80, this.cameras.main.height - 20, '↓', 'moveDown');
        createButton(20, this.cameras.main.height - 100, '↑', 'moveUp');

        // Botón de ataque
        this.add.rectangle(this.cameras.main.width - 80, this.cameras.main.height - 80, 70, 70, 0xFF4444)
            .setInteractive()
            .on('pointerdown', () => this.handleAttack());
    }

    update() {
        // 6. Movimiento del jugador
        const acceleration = 600;
        this.player.setAccelerationX(
            this.moveLeft ? -acceleration :
            this.moveRight ? acceleration : 0
        );
        this.player.setAccelerationY(
            this.moveUp ? -acceleration :
            this.moveDown ? acceleration : 0
        );

        // 7. Actualizar posición del ícono de power-up
        if (this.powerUpIcon) {
            this.powerUpIcon.setPosition(this.player.x, this.player.y - 50);
        }

        // 8. Verificar estado del juego
        if (this.gameState.opponentHealth <= 0) this.endGame('player');
        if (this.gameState.playerHealth <= 0) this.endGame('opponent');
    }

    handleAttack() {
        if (this.gameState.attackCooldown || !this.gameState.collectedPowerUp) return;

        this.gameState.attackCooldown = true;
        this.sound.play('attackSound');

        const bullet = this.createBullet(
            this.player.x,
            this.player.y,
            this.gameState.collectedPowerUp.type,
            this.opponent
        );

        this.time.delayedCall(1000, () => {
            this.gameState.attackCooldown = false;
        });

        this.clearPowerUp();
    }

    createBullet(x, y, texture, target) {
        const bullet = this.playerBullets.create(x, y, texture)
            .setScale(0.2)
            .setData({
                damage: this.getBulletDamage(texture),
                processed: false
            });

        this.physics.moveToObject(bullet, target, 500);
        
        this.tweens.add({
            targets: bullet,
            scale: 0.25,
            yoyo: true,
            duration: 300,
            repeat: -1
        });

        this.time.delayedCall(3000, () => {
            if (bullet.active) bullet.destroy();
        });

        return bullet;
    }

    getBulletDamage(texture) {
        const damageMap = {
            'powerUpDesinformation': 25,
            'powerUpRetuits': 15,
            'powerUpShield': 0,
            'powerUpHostigamiento': 20
        };
        return damageMap[texture] || 15;
    }

    handleHit(bullet, target, type) {
        if (bullet.getData('processed')) return;
        bullet.setData('processed', true);

        const isPlayer = type === 'player';
        const healthProp = isPlayer ? 'playerHealth' : 'opponentHealth';
        const invulnerableProp = isPlayer ? 'playerInvulnerable' : 'opponentInvulnerable';

        if (this.gameState[invulnerableProp]) return;

        // Aplicar daño
        this.gameState[healthProp] = Phaser.Math.Clamp(
            this.gameState[healthProp] - bullet.getData('damage'),
            0,
            100
        );

        // Efectos visuales
        target.setTint(0xff0000);
        this.time.delayedCall(1000, () => target.clearTint());

        // Actualizar UI
        this.registry.events.emit("updateHealth", {
            player: this.gameState.playerHealth,
            opponent: this.gameState.opponentHealth
        });

        // Destruir bala
        bullet.destroy();
    }

    spawnPowerUp() {
        const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpShield', 'powerUpHostigamiento'];
        const powerUp = this.powerUps.create(
            Phaser.Math.Between(100, this.cameras.main.width - 100),
            Phaser.Math.Between(100, this.cameras.main.height - 100),
            Phaser.Utils.Array.GetRandom(types)
        )
        .setScale(0.2);

        // Animación flotante
        powerUp.tween = this.tweens.add({
            targets: powerUp,
            y: powerUp.y - 30,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    collectPowerUp(powerUp) {
        if (this.gameState.collectedPowerUp) return;

        this.sound.play('itemPickup');
        
        // Detener animación
        powerUp.tween?.stop();
        
        // Almacenar power-up
        this.gameState.collectedPowerUp = { type: powerUp.texture.key };
        
        // Mostrar ícono
        if (this.powerUpIcon) this.powerUpIcon.destroy();
        this.powerUpIcon = this.add.image(this.player.x, this.player.y - 50, powerUp.texture.key)
            .setScale(0.4)
            .setDepth(1);

        // Destruir power-up
        powerUp.destroy();
    }

    clearPowerUp() {
        this.gameState.collectedPowerUp = null;
        if (this.powerUpIcon) {
            this.powerUpIcon.destroy();
            this.powerUpIcon = null;
        }
    }

    endGame(winner) {
        this.bgMusic.stop();
        this.scene.stop('UIScene');
        this.scene.start('EndScene', { winner });
    }

    setupTimers() {
        // Temporizador de power-ups
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        // Temporizador de ataques del oponente
        this.time.addEvent({
            delay: 6000,
            callback: () => {
                const bullet = this.opponentBullets.create(
                    this.opponent.x,
                    this.opponent.y,
                    'powerUpRetuits'
                )
                .setScale(0.2)
                .setData('damage', 20);

                this.physics.moveToObject(bullet, this.player, 400);
                this.time.delayedCall(3000, () => bullet.active && bullet.destroy());
            },
            loop: true
        });
    }
}