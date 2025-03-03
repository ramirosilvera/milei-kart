export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.setupScene();
        this.setupPhysics();
        this.createGameObjects();
        this.setupControls();
        this.setupTimers();

        // Inicialización de power‑ups para jugador y oponente
        this.gameState.playerPowerUp = null;
        this.gameState.opponentPowerUp = null;
        this.gameState.opponentAttackCooldown = false;

        // Lanzamos la UIScene para la interfaz
        this.scene.launch("UIScene");
    }

    // Configuración básica del escenario y estado
    setupScene() {
        // Fondo y música
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'track')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // Estado inicial del juego
        this.gameState = {
            playerHealth: 100,
            opponentHealth: 100,
            attackCooldown: false,
            playerInvulnerable: false,
            opponentInvulnerable: false,
            moveLeft: false,
            moveRight: false,
            moveUp: false,
            moveDown: false
        };

        this.gameOver = false;
    }

    // Configuración de físicas (sin colisiones automáticas)
    setupPhysics() {
        // Crear jugador
        this.player = this.physics.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            'mileiKart'
        )
        .setScale(0.1)
        .setCollideWorldBounds(true)
        .setDrag(600, 600)
        .setMaxVelocity(300);

        // Crear oponente
        this.opponent = this.physics.add.sprite(
            this.cameras.main.centerX,
            100,
            'opponentKart'
        )
        .setScale(0.1)
        .setBounce(1, 0)
        .setCollideWorldBounds(true)
        .setVelocityX(100);

        // Grupos para balas y power‑ups (sin añadir colisiones físicas)
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();
        this.powerUps = this.physics.add.group();
    }

    // No se crea UI en esta escena para evitar cargas extras
    createGameObjects() {
        // Puede incluir elementos extra si se requiere
    }

    // ─────────────────────────────
    // Controles: Joystick y Botón de Ataque
    // ─────────────────────────────
    setupControls() {
        this.setupJoystick();
        this.setupAttackButton();
    }

    setupJoystick() {
        const baseX = 100, baseY = this.cameras.main.height - 100;
        const radius = 50; // Botones circulares grandes

        // Botón ↑
        this.upButton = this.add.circle(baseX, baseY - 70, radius, 0x333333, 0.8).setInteractive();
        this.add.text(baseX, baseY - 70, '↑', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        // Botón ←
        this.leftButton = this.add.circle(baseX - 70, baseY, radius, 0x333333, 0.8).setInteractive();
        this.add.text(baseX - 70, baseY, '←', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        // Botón ↓
        this.downButton = this.add.circle(baseX, baseY + 70, radius, 0x333333, 0.8).setInteractive();
        this.add.text(baseX, baseY + 70, '↓', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        // Botón →
        this.rightButton = this.add.circle(baseX + 70, baseY, radius, 0x333333, 0.8).setInteractive();
        this.add.text(baseX + 70, baseY, '→', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Eventos de entrada
        this.upButton.on('pointerdown', () => { this.gameState.moveUp = true; });
        this.upButton.on('pointerup', () => { this.gameState.moveUp = false; });
        this.upButton.on('pointerout', () => { this.gameState.moveUp = false; });

        this.downButton.on('pointerdown', () => { this.gameState.moveDown = true; });
        this.downButton.on('pointerup', () => { this.gameState.moveDown = false; });
        this.downButton.on('pointerout', () => { this.gameState.moveDown = false; });

        this.leftButton.on('pointerdown', () => { this.gameState.moveLeft = true; });
        this.leftButton.on('pointerup', () => { this.gameState.moveLeft = false; });
        this.leftButton.on('pointerout', () => { this.gameState.moveLeft = false; });

        this.rightButton.on('pointerdown', () => { this.gameState.moveRight = true; });
        this.rightButton.on('pointerup', () => { this.gameState.moveRight = false; });
        this.rightButton.on('pointerout', () => { this.gameState.moveRight = false; });
    }

    setupAttackButton() {
        const btnX = this.cameras.main.width - 100;
        const btnY = this.cameras.main.height - 100;
        const radius = 60;
        this.attackButton = this.add.circle(btnX, btnY, radius, 0xFF4444, 0.8).setInteractive();
        this.add.text(btnX, btnY, 'ATACAR', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.attackButton.on('pointerdown', () => {
            this.tweens.add({
                targets: this.attackButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power1',
                onComplete: () => { this.handleAttack(); }
            });
        });
        this.attackButton.on('pointerup', () => {
            this.tweens.add({
                targets: this.attackButton,
                scale: 1,
                duration: 100,
                ease: 'Power1'
            });
        });
    }

    // ─────────────────────────────
    // Temporizadores
    // ─────────────────────────────
    setupTimers() {
        // Spawn periódico de power‑ups
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });
    }

    // ─────────────────────────────
    // Ciclo principal y actualización
    // ─────────────────────────────
    update() {
        if (this.gameOver) return;

        // Actualizar movimiento del jugador según controles
        const acceleration = 600;
        this.player.setAccelerationX(
            this.gameState.moveLeft ? -acceleration :
            this.gameState.moveRight ? acceleration : 0
        );
        this.player.setAccelerationY(
            this.gameState.moveUp ? -acceleration :
            this.gameState.moveDown ? acceleration : 0
        );

        // Actualizar comportamiento del oponente
        this.opponentBehavior();

        // Comprobación manual de impactos: balas y power‑ups
        this.checkBulletCollisions();
        this.checkPowerUpCollections();

        // Comprobación de fin del juego
        if (this.gameState.playerHealth <= 0) this.endGame('opponent');
        if (this.gameState.opponentHealth <= 0) this.endGame('player');
    }

    // ─────────────────────────────
    // Comprobación manual de colisiones (por distancia)
    // ─────────────────────────────
    checkBulletCollisions() {
        const hitThreshold = 30; // Distancia para considerar un impacto

        // Balas del jugador contra el oponente
        this.playerBullets.getChildren().forEach(bullet => {
            if (!bullet.active) return;
            let d = Phaser.Math.Distance.Between(bullet.x, bullet.y, this.opponent.x, this.opponent.y);
            if (d < hitThreshold) {
                this.handleHit(bullet, this.opponent, 'opponent');
            }
        });
        // Balas del oponente contra el jugador
        this.opponentBullets.getChildren().forEach(bullet => {
            if (!bullet.active) return;
            let d = Phaser.Math.Distance.Between(bullet.x, bullet.y, this.player.x, this.player.y);
            if (d < hitThreshold) {
                this.handleHit(bullet, this.player, 'player');
            }
        });
    }

    checkPowerUpCollections() {
        const collectThreshold = 40; // Distancia para recoger un power‑up

        this.powerUps.getChildren().forEach(powerUp => {
            if (!powerUp.active) return;
            // Para el jugador
            let dPlayer = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.player.x, this.player.y);
            if (dPlayer < collectThreshold && !this.gameState.playerPowerUp) {
                this.collectPowerUp(this.player, powerUp);
            }
            // Para el oponente
            let dOpponent = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.opponent.x, this.opponent.y);
            if (dOpponent < collectThreshold && !this.gameState.opponentPowerUp) {
                this.collectPowerUpForOpponent(this.opponent, powerUp);
            }
        });
    }

    // ─────────────────────────────
    // Inteligencia básica del oponente
    // ─────────────────────────────
    opponentBehavior() {
        if (!this.gameState.opponentPowerUp) {
            // Si no tiene power‑up, busca el más cercano
            let closestPowerUp = null;
            let closestDistance = Infinity;
            this.powerUps.getChildren().forEach(pu => {
                if (!pu.active) return;
                let d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, pu.x, pu.y);
                if (d < closestDistance) {
                    closestDistance = d;
                    closestPowerUp = pu;
                }
            });
            if (closestPowerUp) {
                this.physics.moveToObject(this.opponent, closestPowerUp, 150);
            } else {
                // Sin power‑up disponible: sigue al jugador
                this.physics.moveToObject(this.opponent, this.player, 100);
            }
        } else {
            // Con power‑up, se acerca al jugador y ataca si está en rango
            this.physics.moveToObject(this.opponent, this.player, 200);
            let d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, this.player.x, this.player.y);
            if (d < 300) {
                this.opponentAttack();
            }
        }
    }

    // ─────────────────────────────
    // Funciones de ataque y balas
    // ─────────────────────────────
    handleAttack() {
        if (this.gameState.attackCooldown || !this.gameState.playerPowerUp) return;
        this.gameState.attackCooldown = true;
        this.sound.play('attackSound');
        this.attackWithPowerUp('player', this.opponent, this.gameState.playerPowerUp.type);
        this.gameState.playerPowerUp = null;
        this.time.delayedCall(1000, () => { this.gameState.attackCooldown = false; });
    }

    opponentAttack() {
        if (this.gameState.opponentAttackCooldown || !this.gameState.opponentPowerUp) return;
        this.gameState.opponentAttackCooldown = true;
        this.sound.play('attackSound');
        this.attackWithPowerUp('opponent', this.player, this.gameState.opponentPowerUp.type);
        this.gameState.opponentPowerUp = null;
        this.time.delayedCall(1000, () => { this.gameState.opponentAttackCooldown = false; });
    }

    attackWithPowerUp(user, target, powerUpType) {
        // Cada bala usará como textura la imagen del power‑up recogido
        switch (powerUpType) {
            case 'powerUpDesinformation':
                this.createBullet(user, target, { damage: 35, speed: 500, texture: powerUpType });
                break;
            case 'powerUpRetuits':
                [-10, 0, 10].forEach(offset => {
                    this.createBullet(user, target, { damage: 15, speed: 500, angleOffset: offset, texture: powerUpType });
                });
                break;
            case 'powerUpShield':
                this.activateShield(user);
                break;
            case 'powerUpHostigamiento':
                const bullet = this.createBullet(user, target, { damage: 20, speed: 400, texture: powerUpType });
                bullet.setData('hitCallback', (targetSprite) => {
                    this.applySlowEffect(targetSprite);
                });
                break;
            default:
                this.createBullet(user, target, { damage: 15, speed: 500, texture: powerUpType });
        }
    }

    createBullet(user, target, options) {
        const source = (user === 'player') ? this.player : this.opponent;
        const bulletTexture = options.texture || 'bullet';
        const bullet = (user === 'player')
            ? this.playerBullets.create(source.x, source.y, bulletTexture)
            : this.opponentBullets.create(source.x, source.y, bulletTexture);
        // Balas más grandes
        bullet.setScale(0.4);
        bullet.setData('damage', options.damage);

        let angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
        if (options.angleOffset) {
            angle += Phaser.Math.DegToRad(options.angleOffset);
        }
        this.physics.velocityFromRotation(angle, options.speed, bullet.body.velocity);

        // Efecto visual de pulso
        this.tweens.add({
            targets: bullet,
            scale: 0.5,
            yoyo: true,
            duration: 300,
            repeat: -1
        });
        // Destruir bala después de 3 segundos si no impacta
        this.time.delayedCall(3000, () => { if (bullet.active) bullet.destroy(); });
        return bullet;
    }

    activateShield(user) {
        const sprite = (user === 'player') ? this.player : this.opponent;
        if (user === 'player') {
            this.gameState.playerInvulnerable = true;
        } else {
            this.gameState.opponentInvulnerable = true;
        }
        const shield = this.add.circle(sprite.x, sprite.y, 40, 0x00ffff, 0.3);
        this.tweens.add({
            targets: shield,
            alpha: 0,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                shield.destroy();
                if (user === 'player') {
                    this.gameState.playerInvulnerable = false;
                } else {
                    this.gameState.opponentInvulnerable = false;
                }
            }
        });
    }

    applySlowEffect(targetSprite) {
        if (targetSprite.body && targetSprite.body.velocity) {
            targetSprite.body.velocity.scale(0.5);
        }
    }

    handleHit(bullet, target, targetType) {
        if (bullet.getData('processed')) return;
        bullet.setData('processed', true);

        const isPlayer = targetType === 'player';
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

        if (bullet.getData('hitCallback')) {
            bullet.getData('hitCallback')(target);
        }
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

    // ─────────────────────────────
    // Power‑up: Spawn y recolección
    // ─────────────────────────────
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

    collectPowerUp(sprite, powerUp) {
        if (sprite === this.player && !this.gameState.playerPowerUp) {
            const type = powerUp.texture.key;
            this.gameState.playerPowerUp = { type };
            powerUp.destroy();
        }
    }

    collectPowerUpForOpponent(sprite, powerUp) {
        if (sprite === this.opponent && !this.gameState.opponentPowerUp) {
            const type = powerUp.texture.key;
            this.gameState.opponentPowerUp = { type };
            powerUp.destroy();
        }
    }

    // ─────────────────────────────
    // Fin del juego
    // ─────────────────────────────
    endGame(winner) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.bgMusic.stop();
        this.scene.start('EndScene', { winner });
    }
}