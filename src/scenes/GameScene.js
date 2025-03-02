export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Configuración inicial
        this.setupScene();
        this.setupPhysics();
        this.createGameObjects();
        this.setupEventListeners();
        this.setupControls();
        this.setupTimers();
        // Se sigue utilizando la UI de la UIScene
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
            opponentInvulnerable: false,
            moveLeft: false,
            moveRight: false,
            moveUp: false,
            moveDown: false
        };

        // Flag para evitar llamadas repetidas a fin de juego
        this.gameOver = false;
    }

    setupPhysics() {
        // Configuración física del jugador y oponente
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
        // Elementos iniciales del juego
        this.powerUpIcon = null;
        this.scene.launch("UIScene");
    }

    setupEventListeners() {
        // Colisiones entre balas y personajes, y entre jugador y power-ups
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
        // Función auxiliar para crear botones con tamaño mayor (80x80) y animaciones
        const createButton = (x, y, text, action) => {
            const btn = this.add.rectangle(x, y, 80, 80, 0x333333, 0.8)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive();

            btn.on('pointerdown', () => {
                this.gameState[action] = true;
                this.tweens.add({
                    targets: btn,
                    scale: 0.9,
                    duration: 100,
                    ease: 'Power1'
                });
            });
            btn.on('pointerup', () => {
                this.gameState[action] = false;
                this.tweens.add({
                    targets: btn,
                    scale: 1,
                    duration: 100,
                    ease: 'Power1'
                });
            });
            btn.on('pointerout', () => {
                this.gameState[action] = false;
                this.tweens.add({
                    targets: btn,
                    scale: 1,
                    duration: 100,
                    ease: 'Power1'
                });
            });
            
            this.add.text(x, y, text, { fontSize: '28px', fill: '#fff' })
                .setOrigin(0.5);
        };

        // Nueva ubicación para botones de dirección (D-pad en esquina inferior izquierda)
        // Posiciones ajustadas para que queden bien centrados
        createButton(70, this.cameras.main.height - 100, '←', 'moveLeft');
        createButton(150, this.cameras.main.height - 100, '→', 'moveRight');
        createButton(110, this.cameras.main.height - 150, '↑', 'moveUp');
        createButton(110, this.cameras.main.height - 50, '↓', 'moveDown');

        // Botón de ataque agrandado (100x100) y ubicado en la esquina inferior derecha
        const attackBtn = this.add.rectangle(this.cameras.main.width - 80, this.cameras.main.height - 120, 100, 100, 0xFF4444)
            .setInteractive();
        attackBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: attackBtn,
                scale: 0.9,
                duration: 100,
                ease: 'Power1',
                onComplete: () => {
                    this.handleAttack();
                }
            });
        });
        attackBtn.on('pointerup', () => {
            this.tweens.add({
                targets: attackBtn,
                scale: 1,
                duration: 100,
                ease: 'Power1'
            });
        });
        // Texto llamativo para el botón de ataque
        this.add.text(this.cameras.main.width - 80, this.cameras.main.height - 120, '¡ATACAR!', { 
            fontSize: '20px', fill: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupTimers() {
        // Temporizador para la aparición de power-ups
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        // Temporizador para los ataques del oponente
        this.time.addEvent({
            delay: 6000,
            callback: () => {
                const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpHostigamiento'];
                const bulletType = Phaser.Utils.Array.GetRandom(types);
                const bullet = this.opponentBullets.create(
                    this.opponent.x,
                    this.opponent.y,
                    bulletType
                )
                .setScale(0.2)
                .setData('damage', this.getBulletDamage(bulletType));

                this.physics.moveToObject(bullet, this.player, 400);
                this.time.delayedCall(3000, () => bullet.active && bullet.destroy());
            },
            loop: true
        });
    }

    update() {
        if (this.gameOver) return; // No actualizar si el juego terminó

        // Movimiento del jugador según controles táctiles
        const acceleration = 600;
        this.player.setAccelerationX(
            this.gameState.moveLeft ? -acceleration :
            this.gameState.moveRight ? acceleration : 0
        );
        this.player.setAccelerationY(
            this.gameState.moveUp ? -acceleration :
            this.gameState.moveDown ? acceleration : 0
        );

        // Actualizar posición del ícono de power-up
        if (this.powerUpIcon) {
            this.powerUpIcon.setPosition(this.player.x, this.player.y - 50);
        }

        // Verificar condiciones de fin del juego
        if (this.gameState.opponentHealth <= 0) this.endGame('player');
        if (this.gameState.playerHealth <= 0) this.endGame('opponent');
    }

    handleAttack() {
        if (this.gameState.attackCooldown || !this.gameState.collectedPowerUp) return;

        this.gameState.attackCooldown = true;
        this.sound.play('attackSound');

        if (this.gameState.collectedPowerUp.type === 'powerUpShield') {
            this.activateShield();
        } else {
            this.createBullet(
                this.player.x,
                this.player.y,
                this.gameState.collectedPowerUp.type,
                this.opponent
            );
        }

        this.time.delayedCall(1000, () => {
            this.gameState.attackCooldown = false;
        });

        this.clearPowerUp();
    }

    activateShield() {
        this.gameState.playerInvulnerable = true;
        const shield = this.add.circle(this.player.x, this.player.y, 40, 0x00ffff, 0.3);
        this.tweens.add({
            targets: shield,
            alpha: 0,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                shield.destroy();
                this.gameState.playerInvulnerable = false;
            }
        });
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

        if (this.gameState[invulnerableProp]) {
            bullet.destroy();
            return;
        }

        this.gameState[healthProp] = Phaser.Math.Clamp(
            this.gameState[healthProp] - bullet.getData('damage'),
            0,
            100
        );

        target.setTint(0xff0000);
        this.addHitParticles(target.x, target.y);
        this.time.delayedCall(300, () => target.clearTint());

        this.registry.events.emit("updateHealth", {
            player: this.gameState.playerHealth,
            opponent: this.gameState.opponentHealth
        });

        bullet.destroy();
    }

    addHitParticles(x, y) {
        const particles = this.add.particles('spark');
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: -100, max: 100 },
            lifespan: 300,
            quantity: 10,
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD'
        });
        this.time.delayedCall(300, () => particles.destroy());
    }

    spawnPowerUp() {
        const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpShield', 'powerUpHostigamiento'];
        const randomType = Phaser.Utils.Array.GetRandom(types);
        const powerUp = this.powerUps.create(
            Phaser.Math.Between(100, this.cameras.main.width - 100),
            Phaser.Math.Between(100, this.cameras.main.height - 100),
            randomType
        )
        .setScale(0.2)
        .setAlpha(0);

        this.tweens.add({
            targets: powerUp,
            alpha: 1,
            duration: 500,
            ease: 'Linear'
        });

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
        
        if (powerUp.tween) powerUp.tween.stop();
        
        this.gameState.collectedPowerUp = { type: powerUp.texture.key };
        
        if (this.powerUpIcon) this.powerUpIcon.destroy();
        this.powerUpIcon = this.add.image(this.player.x, this.player.y - 50, powerUp.texture.key)
            .setScale(0.4)
            .setAlpha(0)
            .setDepth(1);
        this.tweens.add({
            targets: this.powerUpIcon,
            alpha: 1,
            duration: 300,
            ease: 'Linear'
        });

        powerUp.destroy();
    }

    clearPowerUp() {
        this.gameState.collectedPowerUp = null;
        if (this.powerUpIcon) {
            this.tweens.add({
                targets: this.powerUpIcon,
                alpha: 0,
                duration: 300,
                ease: 'Linear',
                onComplete: () => {
                    this.powerUpIcon.destroy();
                    this.powerUpIcon = null;
                }
            });
        }
    }

    endGame(winner) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.bgMusic.stop();
        this.scene.stop('UIScene');
        this.scene.start('EndScene', { winner });
    }
}