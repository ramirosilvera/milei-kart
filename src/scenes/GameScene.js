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

        // Variable para almacenar el power‑up colectado
        this.collectedPowerUp = null;
        this.collectedPowerIcon = null; // Icono que se muestra en el inventario del jugador

        // Crear contenedor del jugador (karts con scale 0.1)
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

        // Grupos de proyectiles (los bullets del jugador serán los power‑ups lanzados)
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();

        // Colisiones entre proyectiles y karts
        this.physics.add.overlap(this.playerBullets, this.opponent, this.hitOpponent, null, this);
        this.physics.add.overlap(this.opponentBullets, this.playerContainer, this.hitPlayer, null, this);
        // Colisión para recoger power‑ups
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

        // Lanzar la UIScene para que aparezca la barra de salud fija en el canvas
        this.scene.launch("UIScene");

        // El oponente ataca cada 3 segundos
        this.time.addEvent({
            delay: 3000,
            callback: this.opponentAttack,
            callbackScope: this,
            loop: true
        });

        // Los power-ups aparecen cada 3 segundos (scale 0.2)
        this.time.addEvent({
            delay: 3000,
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

        // Botón de Ataque en la esquina inferior derecha:
        // El ataque lanza el power‑up colectado (si lo hay)
        const attackContainer = this.add.container(this.cameras.main.width - 100, this.cameras.main.height - 100);
        const btnAttack = this.add.rectangle(0, 0, 70, 70, 0xFF2222, 1).setStrokeStyle(2, 0xffffff);
        const txtAttack = this.add.text(0, 0, "Ataque", { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        attackContainer.add([btnAttack, txtAttack]);
        btnAttack.setInteractive();
        btnAttack.on('pointerdown', () => { this.playerAttack(); });
    }

    update() {
        const acceleration = 600;
        // Movimiento con teclado o controles táctiles
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
        // Verificar condiciones de victoria/derrota
        if (this.opponentHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'player' });
        } else if (this.playerHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'opponent' });
        }
    }

    // El jugador lanza el power‑up que haya colectado (si lo tiene)
    playerAttack() {
        if (this.attackCooldown && !this.playerBoostAttack) return;
        if (!this.collectedPowerUp) {
            // No hay power‑up en inventario; se puede reproducir un sonido o ignorar
            return;
        }
        this.attackCooldown = true;
        this.sound.play('attackSound');

        const powerUpType = this.collectedPowerUp.type;
        // Eliminar el power‑up del inventario y su icono
        this.collectedPowerUp = null;
        if (this.collectedPowerIcon) {
            this.collectedPowerIcon.destroy();
            this.collectedPowerIcon = null;
        }

        // Crear el bullet usando el mismo texture del power‑up, con scale duplicado: de 0.2 (power‑up) a 0.4 (bullet)
        const bullet = this.playerBullets.create(this.playerContainer.x, this.playerContainer.y, powerUpType);
        bullet.setScale(0.4);
        bullet.displayWidth = 40;
        bullet.displayHeight = 40;
        // Efecto de pulsación para el bullet
        this.tweens.add({
            targets: bullet,
            scaleX: { from: 0.4, to: 0.52 },
            scaleY: { from: 0.4, to: 0.52 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });
        // Dirección hacia el oponente
        const direction = new Phaser.Math.Vector2(
            this.opponent.x - this.playerContainer.x,
            this.opponent.y - this.playerContainer.y
        ).normalize();
        bullet.body.velocity.x = direction.x * 500;
        bullet.body.velocity.y = direction.y * 500;
        bullet.setData("processed", false);

        // Propiedades según el tipo de power‑up
        const powerUpProperties = {
            powerUpDesinformation: { damage: 25, effect: (scene, bullet) => {
                // Ralentiza al oponente durante 5 segundos
                scene.opponent.body.velocity.x *= 0.5;
                scene.time.delayedCall(5000, () => { scene.opponent.body.velocity.x *= 2; }, [], scene);
            }},
            powerUpRetuits: { damage: 15, effect: (scene, bullet) => {
                // Permite atacar sin cooldown durante 5 segundos
                scene.playerBoostAttack = true;
                scene.time.delayedCall(5000, () => { scene.playerBoostAttack = false; }, [], scene);
            }},
            powerUpShield: { damage: 0, effect: (scene, bullet) => {
                // Si impacta, aturde al oponente durante 2 segundos
                scene.opponent.body.velocity.x = 0;
                scene.opponent.body.velocity.y = 0;
                scene.time.delayedCall(2000, () => { scene.opponent.body.velocity.x = 100; }, [], scene);
            }},
            powerUpHostigamiento: { damage: 20, effect: (scene, bullet) => {
                // Efecto adicional, p. ej. disparar ráfaga (se puede implementar)
            }}
        };

        bullet.setData("powerUpType", powerUpType);
        bullet.setData("damage", powerUpProperties[powerUpType].damage);
        bullet.setData("effect", powerUpProperties[powerUpType].effect);

        // Destruir el bullet después de 3 segundos si no impacta
        this.time.delayedCall(3000, () => {
            if (bullet.active) { bullet.destroy(); }
        }, [], this);
        this.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        }, [], this);
    }

    // El oponente ataca cada 3 segundos con un ataque genérico
    opponentAttack() {
        this.sound.play('attackSound');
        const bullet = this.opponentBullets.create(this.opponent.x, this.opponent.y, 'powerUpRetuits'); // ejemplo de ataque genérico
        bullet.setScale(0.4);
        bullet.displayWidth = 40;
        bullet.displayHeight = 40;
        this.tweens.add({
            targets: bullet,
            scaleX: { from: 0.4, to: 0.52 },
            scaleY: { from: 0.4, to: 0.52 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });
        const direction = new Phaser.Math.Vector2(
            this.playerContainer.x - this.opponent.x,
            this.playerContainer.y - this.opponent.y
        ).normalize();
        bullet.body.velocity.x = direction.x * 500;
        bullet.body.velocity.y = direction.y * 500;
        bullet.setData("processed", false);
        this.time.delayedCall(3000, () => {
            if (bullet.active) { bullet.destroy(); }
        }, [], this);
    }

    // Los power‑ups aparecen cada 3 segundos; se muestran con scale 0.2 (dos veces mayor que antes de 0.1)
    spawnPowerUp() {
        const types = ['powerUpDesinformation', 'powerUpRetuits', 'powerUpShield', 'powerUpHostigamiento'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const y = Phaser.Math.Between(150, this.cameras.main.height - 150);
        const powerUp = this.powerUps.create(x, y, type).setScale(0.2);
        powerUp.tween = this.tweens.add({
            targets: powerUp,
            y: powerUp.y - 20,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut'
        });
    }

    // Al recoger un power‑up, el jugador lo guarda para usarlo en su siguiente ataque
    collectPowerUp(player, powerUp) {
        this.sound.play('itemPickup');
        if (powerUp.tween) powerUp.tween.stop();
        // Almacenar el power‑up con su tipo
        this.collectedPowerUp = { type: powerUp.texture.key };
        // Mostrar un icono en el jugador (scale duplicado: de 0.2 a 0.4)
        if (this.collectedPowerIcon) this.collectedPowerIcon.destroy();
        this.collectedPowerIcon = this.add.image(0, -50, powerUp.texture.key).setScale(0.4);
        this.playerContainer.add(this.collectedPowerIcon);
        powerUp.destroy();
    }

    // Cuando un bullet del jugador impacta en el oponente
    hitOpponent(bullet, opponent) {
        if (!bullet.active) return;
        if (bullet.getData("processed")) return;
        bullet.setData("processed", true);
        if (bullet.texture.key) {
            // Se puede destruir la imagen asociada
        }
        bullet.disableBody(true, true);
        this.sound.play('collisionSound');
        const damage = bullet.getData("damage") || 20;
        this.opponentHealth -= damage;
        if (this.opponentHealth < 0) this.opponentHealth = 0;
        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
        // Aplicar el efecto especial del power‑up, si lo tiene
        const effect = bullet.getData("effect");
        if (effect && typeof effect === "function") {
            effect(this, bullet);
        }
        bullet.destroy();
    }

    // Cuando un bullet del oponente impacta al jugador
    hitPlayer(bullet, player) {
        if (!bullet.active) return;
        if (bullet.getData("processed")) return;
        bullet.setData("processed", true);
        if (bullet.texture.key) {
            // Se destruye la imagen asociada
        }
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