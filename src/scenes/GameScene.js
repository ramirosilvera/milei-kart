export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Configuración inicial
        this.cameras.main.fadeIn(1000);
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'track')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Sistema de sonido
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // Estado del juego
        this.gameState = {
            playerHealth: 100,
            opponentHealth: 100,
            attackCooldown: false,
            playerBoostAttack: false,
            opponentInvulnerable: false,
            playerInvulnerable: false,
            collectedPowerUp: null
        };

        // Física del jugador
        this.player = this.physics.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            'mileiKart'
        )
        .setScale(0.1)
        .setCollideWorldBounds(true)
        .setDrag(600, 600)
        .setMaxVelocity(300);

        // Física del oponente
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
        this.playerBullets = this.physics.add.group({ classType: Phaser.GameObjects.Sprite });
        this.opponentBullets = this.physics.add.group({ classType: Phaser.GameObjects.Sprite });

        // Colisiones optimizadas
        this.physics.add.overlap(this.playerBullets, this.opponent, this.handleOpponentHit, null, this);
        this.physics.add.overlap(this.opponentBullets, this.player, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // Controles táctiles completos
        this.createTouchControls();
        this.scene.launch("UIScene");

        // Temporizadores con gestión de memoria
        this.setupTimers();
    }

    createTouchControls() {
        // Botones direccionales
        const controlSize = 50;
        const controlOffset = 70;
        const controlAlpha = 0.8;
        
        // Contenedor principal
        const controls = this.add.container(100, this.cameras.main.height - 100);
        
        // Función para crear botones reutilizable
        const createButton = (x, y, text, callback) => {
            const btn = this.add.rectangle(x, y, controlSize, controlSize, 0x555555, controlAlpha)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive();
            
            const txt = this.add.text(x, y, text, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
            
            btn.on('pointerdown', callback);
            btn.on('pointerup', () => this.resetMovement());
            btn.on('pointerout', () => this.resetMovement());
            
            controls.add([btn, txt]);
        };

        // Botones direccionales
        createButton(-controlOffset, 0, '←', () => this.moveLeft = true);
        createButton(controlOffset, 0, '→', () => this.moveRight = true);
        createButton(0, -controlOffset, '↑', () => this.moveUp = true);
        createButton(0, controlOffset, '↓', () => this.moveDown = true);

        // Botón de ataque
        const attackBtn = this.add.rectangle(
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            70, 70, 0xFF2222, 1
        )
        .setStrokeStyle(2, 0xffffff)
        .setInteractive()
        .on('pointerdown', () => this.handleAttack());
        
        this.add.text(attackBtn.x, attackBtn.y, 'Ataque', { fontSize: '18px', fill: '#fff' })
            .setOrigin(0.5);
    }

    setupTimers() {
        // Temporizador de ataque del oponente
        this.opponentAttackTimer = this.time.addEvent({
            delay: 6000,
            callback: () => {
                if (!this.opponent.active) return;
                this.launchOpponentAttack();
            },
            loop: true
        });

        // Temporizador de power-ups
        this.powerUpTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // Movimiento suavizado
        const acceleration = 600;
        this.player.setAcceleration(
            this.moveLeft ? -acceleration : this.moveRight ? acceleration : 0,
            this.moveUp ? -acceleration : this.moveDown ? acceleration : 0
        );

        // Gestión de estado del juego
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
            this.playerBullets,
            0.2,
            this.opponent
        );

        this.setBulletEffect(bullet, this.gameState.collectedPowerUp.type);
        this.clearPowerUp();
        
        this.time.delayedCall(1000, () => this.gameState.attackCooldown = false);
    }

    launchOpponentAttack() {
        const bullet = this.createBullet(
            this.opponent.x,
            this.opponent.y,
            'powerUpRetuits',
            this.opponentBullets,
            0.2,
            this.player
        );
        
        bullet.setData('damage', 20);
    }

    createBullet(x, y, texture, group, scale, target) {
        const bullet = group.create(x, y, texture)
            .setScale(scale)
            .setDisplaySize(20, 20)
            .setData('processed', false);

        this.physics.moveToObject(bullet, target, 500);
        
        this.tweens.add({
            targets: bullet,
            scaleX: scale * 1.2,
            scaleY: scale * 1.2,
            yoyo: true,
            duration: 300,
            repeat: -1
        });

        this.time.delayedCall(3000, () => bullet.active && bullet.destroy());
        
        return bullet;
    }

    handleOpponentHit(bullet, opponent) {
        if (this.validateHit(bullet, this.gameState.opponentInvulnerable)) return;
        
        this.processHit({
            target: opponent,
            healthProperty: 'opponentHealth',
            invulnerabilityFlag: 'opponentInvulnerable',
            bullet: bullet,
            damage: bullet.getData('damage'),
            effect: bullet.getData('effect')
        });
    }

    handlePlayerHit(bullet, player) {
        if (this.validateHit(bullet, this.gameState.playerInvulnerable)) return;
        
        this.processHit({
            target: player,
            healthProperty: 'playerHealth',
            invulnerabilityFlag: 'playerInvulnerable',
            bullet: bullet,
            damage: 20
        });
    }

    validateHit(bullet, invulnerabilityFlag) {
        return !bullet.active || bullet.getData('processed') || invulnerabilityFlag;
    }

    processHit(config) {
        // Destrucción segura del proyectil
        config.bullet.getData('tween')?.stop();
        config.bullet.setData('processed', true).destroy();
        
        // Sistema de daño
        this.sound.play('collisionSound');
        this.gameState[config.healthProperty] = Phaser.Math.Clamp(
            this.gameState[config.healthProperty] - config.damage,
            0,
            100
        );
        
        // Efectos visuales
        this.applyHitEffects(config.target, config.invulnerabilityFlag);
        
        // Aplicar efecto especial
        config.effect?.(this);
        
        // Actualizar UI
        this.registry.events.emit("updateHealth", {
            player: this.gameState.playerHealth,
            opponent: this.gameState.opponentHealth
        });
    }

    applyHitEffects(target, invulnerabilityFlag) {
        this.gameState[invulnerabilityFlag] = true;
        target.setTint(0xff0000);
        
        this.time.delayedCall(1000, () => {
            this.gameState[invulnerabilityFlag] = false;
            target.clearTint();
        });
    }

    spawnPowerUp() {
        const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpShield', 'powerUpHostigamiento'];
        const powerUp = this.powerUps.create(
            Phaser.Math.Between(100, this.cameras.main.width - 100),
            Phaser.Math.Between(150, this.cameras.main.height - 150),
            Phaser.Utils.Array.GetRandom(types)
        )
        .setScale(0.2)
        .setData('tween', this.tweens.add({
            targets: this,
            y: '-=20',
            yoyo: true,
            repeat: -1,
            duration: 800
        }));
    }

    collectPowerUp(player, powerUp) {
        this.sound.play('itemPickup');
        powerUp.getData('tween')?.stop();
        
        this.gameState.collectedPowerUp = { type: powerUp.texture.key };
        this.showPowerUpIcon(powerUp.texture.key);
        
        powerUp.destroy();
    }

    showPowerUpIcon(texture) {
        if (this.powerUpIcon) this.powerUpIcon.destroy();
        this.powerUpIcon = this.add.image(player.x, player.y - 50, texture)
            .setScale(0.4)
            .setDepth(1);
    }

    clearPowerUp() {
        this.gameState.collectedPowerUp = null;
        this.powerUpIcon?.destroy();
    }

    resetMovement() {
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
    }

    endGame(winner) {
        this.bgMusic.stop();
        this.scene.stop('UIScene');
        this.scene.start('EndScene', { winner });
    }
}