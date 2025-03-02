export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.setupScene();
        this.setupPhysics();
        this.createGameObjects();
        this.setupEventListeners();
        this.setupControls();
        this.setupTimers();
        
        // Inicializar power‑ups para jugador y oponente
        this.gameState.playerPowerUp = null;
        this.gameState.opponentPowerUp = null;
        this.gameState.opponentAttackCooldown = false;
    }

    setupScene() {
        // Fondo y música
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'track')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // Estado inicial
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

        // Grupos para balas y power‑ups
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();
        this.powerUps = this.physics.add.group();
    }

    createGameObjects() {
        this.powerUpIcon = null;
        this.scene.launch("UIScene");
    }

    setupEventListeners() {
        // Colisiones de balas contra el oponente y jugador
        this.physics.add.overlap(
            this.playerBullets,
            this.opponent,
            (bullet, target) => this.handleHit(bullet, target, 'opponent'),
            null,
            this
        );
        this.physics.add.overlap(
            this.opponentBullets,
            this.player,
            (bullet, target) => this.handleHit(bullet, target, 'player'),
            null,
            this
        );

        // Colisiones de power‑ups para ambos personajes
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            (player, powerUp) => this.collectPowerUp(player, powerUp),
            null,
            this
        );
        this.physics.add.overlap(
            this.opponent,
            this.powerUps,
            (opponent, powerUp) => this.collectPowerUpForOpponent(opponent, powerUp),
            null,
            this
        );
    }

    setupControls() {
        // Función auxiliar para crear botones agrandados (80×80) con animaciones
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

        // Ubicación de botones en formato D-pad en la esquina inferior izquierda
        createButton(70, this.cameras.main.height - 100, '←', 'moveLeft');
        createButton(150, this.cameras.main.height - 100, '→', 'moveRight');
        createButton(110, this.cameras.main.height - 150, '↑', 'moveUp');
        createButton(110, this.cameras.main.height - 50, '↓', 'moveDown');

        // Botón de ataque en la esquina inferior derecha (agrandado a 100×100)
        const attackBtn = this.add.rectangle(this.cameras.main.width - 80, this.cameras.main.height - 120, 100, 100, 0xFF4444)
            .setInteractive();
        attackBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: attackBtn,
                scale: 0.9,
                duration: 100,
                ease: 'Power1',
                onComplete: () => { this.handleAttack(); }
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
        this.add.text(this.cameras.main.width - 80, this.cameras.main.height - 120, '¡ATACAR!', {
            fontSize: '20px', fill: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

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
    // Funciones para mensajes y power‑ups
    // ─────────────────────────────
    showPowerUpMessage(message, x, y) {
        const msg = this.add.text(x, y, message, {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: msg,
            alpha: 0,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => msg.destroy()
        });
    }

    getPowerUpMessage(type) {
        const messages = {
            powerUpDesinformation: '¡Desinformación activada!',
            powerUpRetuits: '¡Retuits activados!',
            powerUpShield: '¡Escudo activado!',
            powerUpHostigamiento: '¡Hostigamiento activado!'
        };
        return messages[type] || '';
    }

    collectPowerUp(sprite, powerUp) {
        if (sprite === this.player && !this.gameState.playerPowerUp) {
            const type = powerUp.texture.key;
            this.gameState.playerPowerUp = { type };
            this.showPowerUpMessage(this.getPowerUpMessage(type), sprite.x, sprite.y - 50);
            powerUp.destroy();
        }
    }

    collectPowerUpForOpponent(sprite, powerUp) {
        if (sprite === this.opponent && !this.gameState.opponentPowerUp) {
            const type = powerUp.texture.key;
            this.gameState.opponentPowerUp = { type };
            this.showPowerUpMessage(this.getPowerUpMessage(type), sprite.x, sprite.y - 50);
            powerUp.destroy();
        }
    }

    // ─────────────────────────────
    // Funciones de ataque y creación de balas
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
        switch (powerUpType) {
            case 'powerUpDesinformation':
                // Bala con mayor daño
                this.createBullet(user, target, { damage: 35, speed: 500 });
                break;
            case 'powerUpRetuits':
                // Dispara 3 balas en ráfaga con ligeros ángulos distintos
                [-10, 0, 10].forEach(angleOffset => {
                    this.createBullet(user, target, { damage: 15, speed: 500, angleOffset });
                });
                break;
            case 'powerUpShield':
                // Activa escudo sin disparar bala
                this.activateShield(user);
                break;
            case 'powerUpHostigamiento':
                // Bala que al impactar aplica efecto de ralentización
                const bullet = this.createBullet(user, target, { damage: 20, speed: 400 });
                bullet.setData('hitCallback', (targetSprite) => {
                    this.applySlowEffect(targetSprite);
                });
                break;
            default:
                // Disparo básico
                this.createBullet(user, target, { damage: 15, speed: 500 });
        }
    }

    createBullet(user, target, options) {
        const source = (user === 'player') ? this.player : this.opponent;
        const bulletTexture = options.texture || 'bullet';
        const bullet = (user === 'player')
            ? this.playerBullets.create(source.x, source.y, bulletTexture)
            : this.opponentBullets.create(source.x, source.y, bulletTexture);
        bullet.setScale(0.2);
        bullet.setData('damage', options.damage);
        let angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
        if (options.angleOffset) {
            angle += Phaser.Math.DegToRad(options.angleOffset);
        }
        this.physics.velocityFromRotation(angle, options.speed, bullet.body.velocity);
        this.tweens.add({
            targets: bullet,
            scale: 0.25,
            yoyo: true,
            duration: 300,
            repeat: -1
        });
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
        this.showPowerUpMessage(
            user === 'player' ? '¡Escudo activado!' : '¡Escudo del oponente activado!',
            sprite.x,
            sprite.y - 50
        );
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
        this.registry.events.emit("updateHealth", {
            player: this.gameState.playerHealth,
            opponent: this.gameState.opponentHealth
        });
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

    // ─────────────────────────────
    // Ciclo principal y comportamientos
    // ─────────────────────────────
    update() {
        if (this.gameOver) return;
        this.updatePlayerMovement();
        this.opponentBehavior();
        if (this.powerUpIcon) {
            this.powerUpIcon.setPosition(this.player.x, this.player.y - 50);
        }
        if (this.gameState.opponentHealth <= 0) this.endGame('player');
        if (this.gameState.playerHealth <= 0) this.endGame('opponent');
    }

    updatePlayerMovement() {
        const acceleration = 600;
        this.player.setAccelerationX(
            this.gameState.moveLeft ? -acceleration :
            this.gameState.moveRight ? acceleration : 0
        );
        this.player.setAccelerationY(
            this.gameState.moveUp ? -acceleration :
            this.gameState.moveDown ? acceleration : 0
        );
    }

    opponentBehavior() {
        // Inteligencia básica del oponente:
        // Si no tiene power‑up, busca el más cercano; si lo tiene, se acerca al jugador y ataca.
        if (!this.gameState.opponentPowerUp) {
            let closestPowerUp = null;
            let closestDistance = Infinity;
            this.powerUps.getChildren().forEach(pu => {
                let dist = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, pu.x, pu.y);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestPowerUp = pu;
                }
            });
            if (closestPowerUp) {
                this.physics.moveToObject(this.opponent, closestPowerUp, 150);
            } else {
                // Sin power‑up disponible: patrulla o sigue al jugador
                this.physics.moveToObject(this.opponent, this.player, 100);
            }
        } else {
            // Con power‑up, se acerca rápido al jugador
            this.physics.moveToObject(this.opponent, this.player, 200);
            // Si está lo suficientemente cerca y la espera del ataque terminó, ataca
            if (Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, this.player.x, this.player.y) < 300) {
                this.opponentAttack();
            }
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