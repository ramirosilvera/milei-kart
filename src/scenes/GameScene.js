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

        // Grupo para power-ups
        this.powerUps = this.physics.add.group();

        // Crear contenedor del jugador (karts reducidos a scale 0.1)
        this.playerContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 100);
        this.playerSprite = this.add.sprite(0, 0, 'mileiKart').setScale(0.1);
        this.playerContainer.add(this.playerSprite);
        this.physics.world.enable(this.playerContainer);
        this.playerContainer.body.setCollideWorldBounds(true);
        this.playerContainer.body.setDrag(600, 600);
        this.playerContainer.body.setMaxVelocity(300);

        // Crear sprite del oponente (scale 0.1)
        this.opponent = this.physics.add.sprite(this.cameras.main.centerX, 100, 'opponentKart').setScale(0.1);
        this.opponent.body.setCollideWorldBounds(true);
        this.opponent.body.setBounce(1, 0);
        this.opponent.body.setVelocityX(100);

        // Grupos de proyectiles (ataques)
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();

        // Colisiones entre proyectiles y karts
        this.physics.add.overlap(this.playerBullets, this.opponent, this.hitOpponent, null, this);
        this.physics.add.overlap(this.opponentBullets, this.playerContainer, this.hitPlayer, null, this);
        // Colisión para recoger power-ups
        this.physics.add.overlap(this.playerContainer, this.powerUps, this.collectPowerUp, null, this);

        // Controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // Variables para controles táctiles
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        // Crear controles en pantalla (botones direccionales y de ataque)
        this.createOnScreenControls();

        // Ataques automáticos del oponente cada 2 segundos
        this.time.addEvent({
            delay: 2000,
            callback: this.opponentAttack,
            callbackScope: this,
            loop: true
        });

        // Spawn de power-ups cada 8 segundos
        this.time.addEvent({
            delay: 8000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        // Actualizar la UI de salud
        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
    }

    createOnScreenControls() {
        // Controles direccionales en la esquina inferior izquierda
        const controlContainer = this.add.container(100, this.cameras.main.height - 100);

        // Botón Izquierda
        const btnLeft = this.add.rectangle(-60, 0, 50, 50, 0x555555, 0.8).setStrokeStyle(2, 0xffffff);
        const txtLeft = this.add.text(-60, 0, "←", { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        btnLeft.setInteractive();
        btnLeft.on('pointerdown', () => { this.moveLeft = true; });
        btnLeft.on('pointerup', () => { this.moveLeft = false; });
        btnLeft.on('pointerout', () => { this.moveLeft = false; });

        // Botón Derecha
        const btnRight = this.add.rectangle(60, 0, 50, 50, 0x555555, 0.8).setStrokeStyle(2, 0xffffff);
        const txtRight = this.add.text(60, 0, "→", { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        btnRight.setInteractive();
        btnRight.on('pointerdown', () => { this.moveRight = true; });
        btnRight.on('pointerup', () => { this.moveRight = false; });
        btnRight.on('pointerout', () => { this.moveRight = false; });

        // Botón Arriba
        const btnUp = this.add.rectangle(0, -60, 50, 50, 0x555555, 0.8).setStrokeStyle(2, 0xffffff);
        const txtUp = this.add.text(0, -60, "↑", { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        btnUp.setInteractive();
        btnUp.on('pointerdown', () => { this.moveUp = true; });
        btnUp.on('pointerup', () => { this.moveUp = false; });
        btnUp.on('pointerout', () => { this.moveUp = false; });

        // Botón Abajo
        const btnDown = this.add.rectangle(0, 60, 50, 50, 0x555555, 0.8).setStrokeStyle(2, 0xffffff);
        const txtDown = this.add.text(0, 60, "↓", { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        btnDown.setInteractive();
        btnDown.on('pointerdown', () => { this.moveDown = true; });
        btnDown.on('pointerup', () => { this.moveDown = false; });
        btnDown.on('pointerout', () => { this.moveDown = false; });

        controlContainer.add([btnLeft, txtLeft, btnRight, txtRight, btnUp, txtUp, btnDown, txtDown]);

        // Botón de Ataque en la esquina inferior derecha
        const attackContainer = this.add.container(this.cameras.main.width - 100, this.cameras.main.height - 100);
        const btnAttack = this.add.rectangle(0, 0, 70, 70, 0xFF2222, 1).setStrokeStyle(2, 0xffffff);
        const txtAttack = this.add.text(0, 0, "Ataque", { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        attackContainer.add([btnAttack, txtAttack]);
        btnAttack.setInteractive();
        btnAttack.on('pointerdown', () => { this.playerAttack(); });
    }

    update() {
        const acceleration = 600;
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
        if (this.opponentHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'player' });
        } else if (this.playerHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'opponent' });
        }
    }

    playerAttack() {
        if (this.attackCooldown && !this.playerBoostAttack) return;
        this.attackCooldown = true;
        this.sound.play('attackSound');

        // Crear proyectil del jugador (agrandado, tamaño 20)
        const bullet = this.playerBullets.create(this.playerContainer.x, this.playerContainer.y, null);
        bullet.setSize(20, 20);
        bullet.displayWidth = 20;
        bullet.displayHeight = 20;
        // Representar el proyectil como un círculo brillante
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFAA00, 1);
        graphics.fillCircle(10, 10, 10);
        bullet.graphics = graphics;
        bullet.graphics.x = this.playerContainer.x;
        bullet.graphics.y = this.playerContainer.y;

        // Efecto divertido: tween de pulsación (sube y baja de escala)
        this.tweens.add({
            targets: bullet.graphics,
            scaleX: { from: 1, to: 1.3 },
            scaleY: { from: 1, to: 1.3 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        const direction = new Phaser.Math.Vector2(this.opponent.x - this.playerContainer.x, this.opponent.y - this.playerContainer.y).normalize();
        bullet.body.velocity.x = direction.x * 500;
        bullet.body.velocity.y = direction.y * 500;

        bullet.update = () => {
            bullet.graphics.x = bullet.x;
            bullet.graphics.y = bullet.y;
        };

        this.time.delayedCall(3000, () => {
            if (bullet && bullet.graphics) { bullet.graphics.destroy(); }
            bullet.destroy();
        }, [], this);

        this.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        }, [], this);
    }

    opponentAttack() {
        this.sound.play('attackSound');
        const bullet = this.opponentBullets.create(this.opponent.x, this.opponent.y, null);
        bullet.setSize(20, 20);
        bullet.displayWidth = 20;
        bullet.displayHeight = 20;
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00AAFF, 1);
        graphics.fillCircle(10, 10, 10);
        bullet.graphics = graphics;
        bullet.graphics.x = this.opponent.x;
        bullet.graphics.y = this.opponent.y;

        this.tweens.add({
            targets: bullet.graphics,
            scaleX: { from: 1, to: 1.3 },
            scaleY: { from: 1, to: 1.3 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        const direction = new Phaser.Math.Vector2(this.playerContainer.x - this.opponent.x, this.playerContainer.y - this.opponent.y).normalize();
        bullet.body.velocity.x = direction.x * 500;
        bullet.body.velocity.y = direction.y * 500;

        bullet.update = () => {
            bullet.graphics.x = bullet.x;
            bullet.graphics.y = bullet.y;
        };

        this.time.delayedCall(3000, () => {
            if (bullet && bullet.graphics) { bullet.graphics.destroy(); }
            bullet.destroy();
        }, [], this);
    }

    spawnPowerUp() {
        const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpShield', 'powerUpHostigamiento'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const y = Phaser.Math.Between(150, this.cameras.main.height - 150);
        // Power-ups con scale 0.1
        const powerUp = this.powerUps.create(x, y, type).setScale(0.1);
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
        if (powerUp.tween) powerUp.tween.stop();
        const type = powerUp.texture.key;
        powerUp.destroy();

        switch(type) {
            case 'powerUpDesinformation':
                this.opponent.body.velocity.x *= 0.5;
                this.time.delayedCall(5000, () => { this.opponent.body.velocity.x *= 2; }, [], this);
                break;
            case 'powerUpRetuits':
                this.playerBoostAttack = true;
                this.time.delayedCall(5000, () => { this.playerBoostAttack = false; }, [], this);
                break;
            case 'powerUpShield':
                this.playerStatus.shield = true;
                if (!this.shieldSprite) {
                    this.shieldSprite = this.add.circle(0, 0, 45, 0x00FF00, 0.3);
                    this.playerContainer.add(this.shieldSprite);
                }
                break;
            case 'powerUpHostigamiento':
                for (let i = 0; i < 5; i++) {
                    this.time.delayedCall(i * 200, () => { this.playerAttack(); }, [], this);
                }
                break;
        }
    }

    hitOpponent(bullet, opponent) {
        if (bullet.graphics) bullet.graphics.destroy();
        // Desactivar el cuerpo del proyectil para evitar múltiples colisiones
        bullet.disableBody(true, true);
        bullet.destroy();
        this.sound.play('collisionSound');
        this.opponentHealth -= 20;
        if (this.opponentHealth < 0) this.opponentHealth = 0;
        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
    }

    hitPlayer(bullet, player) {
        if (bullet.graphics) bullet.graphics.destroy();
        bullet.disableBody(true, true);
        bullet.destroy();
        if (this.playerStatus.shield) {
            this.playerStatus.shield = false;
            if (this.shieldSprite) { this.shieldSprite.destroy(); this.shieldSprite = null; }
        } else {
            this.sound.play('collisionSound');
            this.playerHealth -= 20;
            if (this.playerHealth < 0) this.playerHealth = 0;
            this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
        }
    }
}