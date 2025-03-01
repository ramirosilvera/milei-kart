export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Fondo de la pista a pantalla completa
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'track')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Música de fondo
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // Inicialización de salud y estado
        this.playerHealth = 100;
        this.opponentHealth = 100;
        this.attackCooldown = false;
        this.playerBoostAttack = false;
        this.playerStatus = { shield: false };
        this.opponentInvulnerable = false;
        this.playerInvulnerable = false;

        // Grupo para power-ups
        this.powerUps = this.physics.add.group();

        // Variable para almacenar el power-up colectado
        this.collectedPowerUp = null;
        this.collectedPowerIcon = null;

        // Crear contenedor del jugador
        this.playerContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 100);
        this.playerSprite = this.add.sprite(0, 0, 'mileiKart').setScale(0.1);
        this.playerContainer.add(this.playerSprite);
        this.physics.world.enable(this.playerContainer);
        this.playerContainer.body.setCollideWorldBounds(true);
        this.playerContainer.body.setDrag(600, 600);
        this.playerContainer.body.setMaxVelocity(300);

        // Crear sprite del oponente
        this.opponent = this.physics.add.sprite(this.cameras.main.centerX, 100, 'opponentKart')
            .setScale(0.1)
            .setBounce(1, 0)
            .setVelocityX(100);
        this.opponent.body.setCollideWorldBounds(true);

        // Grupos de proyectiles
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();

        // Colisiones
        this.physics.add.overlap(this.playerBullets, this.opponent, this.hitOpponent, null, this);
        this.physics.add.overlap(this.opponentBullets, this.playerContainer, this.hitPlayer, null, this);
        this.physics.add.overlap(this.playerContainer, this.powerUps, this.collectPowerUp, null, this);

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        // UI
        this.createOnScreenControls();
        this.scene.launch("UIScene");

        // Temporizadores
        this.time.addEvent({
            delay: 6000,
            callback: this.opponentAttack,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 3000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
    }

    createOnScreenControls() {
        // Controles táctiles (igual que antes)
        // ... (mantener mismo código de controles)
    }

    update() {
        const acceleration = 600;
        // Movimiento
        if (this.cursors.left.isDown || this.moveLeft) {
            this.playerContainer.body.setAccelerationX(-acceleration);
        } else if (this.cursors.right.isDown || this.moveRight) {
            this.playerContainer.body.setAccelerationX(acceleration);
        } else {
            this.playerContainer.body.setAccelerationX(0);
        }

        if (this.cursors.up.isDown || this.moveUp) {
            this.playerContainer.body.setAccelerationY(-acceleration);
        } else if (this.cursors.down.isDown || this.moveDown) {
            this.playerContainer.body.setAccelerationY(acceleration);
        } else {
            this.playerContainer.body.setAccelerationY(0);
        }

        // Verificar ganador
        if (this.opponentHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'player' });
        } else if (this.playerHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'opponent' });
        }
    }

    playerAttack() {
        if ((this.attackCooldown && !this.playerBoostAttack) || !this.collectedPowerUp) return;

        this.attackCooldown = true;
        this.sound.play('attackSound');

        const powerUpType = this.collectedPowerUp.type;
        this.collectedPowerUp = null;
        if (this.collectedPowerIcon) {
            this.collectedPowerIcon.destroy();
            this.collectedPowerIcon = null;
        }

        // Bullet más pequeño (0.2)
        const bullet = this.playerBullets.create(
            this.playerContainer.x,
            this.playerContainer.y,
            powerUpType
        )
        .setScale(0.2)
        .setDisplaySize(20, 20);

        this.tweens.add({
            targets: bullet,
            scaleX: { from: 0.2, to: 0.3 },
            scaleY: { from: 0.2, to: 0.3 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        const direction = new Phaser.Math.Vector2(
            this.opponent.x - this.playerContainer.x,
            this.opponent.y - this.playerContainer.y
        ).normalize();
        
        bullet.setVelocity(direction.x * 500, direction.y * 500);
        bullet.setData("processed", false);

        const powerUpProperties = {
            powerUpDesinformation: { damage: 25, effect: (scene) => {
                scene.opponent.body.velocity.x *= 0.5;
                scene.time.delayedCall(5000, () => scene.opponent.body.velocity.x *= 2);
            }},
            powerUpRetuits: { damage: 15, effect: (scene) => {
                scene.playerBoostAttack = true;
                scene.time.delayedCall(5000, () => scene.playerBoostAttack = false);
            }},
            powerUpShield: { damage: 0, effect: (scene) => {
                scene.opponent.body.setVelocity(0);
                scene.time.delayedCall(2000, () => scene.opponent.body.setVelocityX(100));
            }},
            powerUpHostigamiento: { damage: 20, effect: () => {}}
        };

        bullet.setData("powerUpType", powerUpType)
            .setData("damage", powerUpProperties[powerUpType].damage)
            .setData("effect", powerUpProperties[powerUpType].effect);

        this.time.delayedCall(3000, () => bullet.active && bullet.destroy());
        this.time.delayedCall(1000, () => this.attackCooldown = false);
    }

    opponentAttack() {
        this.sound.play('attackSound');
        
        // Bullet más pequeño (0.2)
        const bullet = this.opponentBullets.create(
            this.opponent.x,
            this.opponent.y,
            'powerUpRetuits'
        )
        .setScale(0.2)
        .setDisplaySize(20, 20);

        this.tweens.add({
            targets: bullet,
            scaleX: { from: 0.2, to: 0.3 },
            scaleY: { from: 0.2, to: 0.3 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        const direction = new Phaser.Math.Vector2(
            this.playerContainer.x - this.opponent.x,
            this.playerContainer.y - this.opponent.y
        ).normalize();
        
        bullet.setVelocity(direction.x * 500, direction.y * 500)
            .setData("processed", false);

        this.time.delayedCall(3000, () => bullet.active && bullet.destroy());
    }

    spawnPowerUp() {
        const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpShield', 'powerUpHostigamiento'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const powerUp = this.powerUps.create(
            Phaser.Math.Between(100, this.cameras.main.width - 100),
            Phaser.Math.Between(150, this.cameras.main.height - 150),
            type
        )
        .setScale(0.2);

        powerUp.tween = this.tweens.add({
            targets: powerUp,
            y: powerUp.y - 20,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut'
        });
    }

    collectPowerUp(player, powerUp) {
        this.sound.play('itemPickup');
        powerUp.tween?.stop();
        
        this.collectedPowerUp = { type: powerUp.texture.key };
        
        if (this.collectedPowerIcon) this.collectedPowerIcon.destroy();
        this.collectedPowerIcon = this.add.image(0, -50, powerUp.texture.key)
            .setScale(0.4);
        this.playerContainer.add(this.collectedPowerIcon);
        
        powerUp.destroy();
    }

    hitOpponent(bullet, opponent) {
        if (!bullet.active || bullet.getData("processed") || this.opponentInvulnerable) return;

        bullet.setData("processed", true);
        this.sound.play('collisionSound');
        
        // Sistema de invulnerabilidad
        this.opponentInvulnerable = true;
        opponent.setTint(0xff0000);
        this.time.delayedCall(1000, () => {
            this.opponentInvulnerable = false;
            opponent.clearTint();
        });

        // Aplicar daño
        this.opponentHealth -= bullet.getData("damage") || 20;
        this.opponentHealth = Phaser.Math.Clamp(this.opponentHealth, 0, 100);
        this.registry.events.emit("updateHealth", { 
            player: this.playerHealth, 
            opponent: this.opponentHealth 
        });

        // Aplicar efecto
        const effect = bullet.getData("effect");
        effect?.(this, bullet);
        
        bullet.destroy();
    }

    hitPlayer(bullet, player) {
        if (!bullet.active || bullet.getData("processed") || this.playerInvulnerable) return;

        bullet.setData("processed", true);
        this.sound.play('collisionSound');
        
        // Sistema de invulnerabilidad
        this.playerInvulnerable = true;
        this.playerSprite.setTint(0xff0000);
        this.time.delayedCall(1000, () => {
            this.playerInvulnerable = false;
            this.playerSprite.clearTint();
        });

        // Aplicar daño
        if (!this.playerStatus.shield) {
            this.playerHealth -= 20;
            this.playerHealth = Phaser.Math.Clamp(this.playerHealth, 0, 100);
            this.registry.events.emit("updateHealth", { 
                player: this.playerHealth, 
                opponent: this.opponentHealth 
            });
        }
        
        bullet.destroy();
    }
}