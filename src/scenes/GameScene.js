export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Fondo de la pista
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'track')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Reproducir música de fondo
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // Inicializar salud
        this.playerHealth = 100;
        this.opponentHealth = 100;

        // Crear contenedor del jugador y habilitar física
        this.playerContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 100);
        this.playerSprite = this.add.sprite(0, 0, 'mileiKart').setScale(0.5);
        this.playerContainer.add(this.playerSprite);
        this.physics.world.enable(this.playerContainer);
        this.playerContainer.body.setCollideWorldBounds(true);
        this.playerContainer.body.setDrag(600, 600);
        this.playerContainer.body.setMaxVelocity(300);

        // Crear sprite del oponente con IA simple
        this.opponent = this.physics.add.sprite(this.cameras.main.centerX, 100, 'opponentKart').setScale(0.5);
        this.opponent.body.setCollideWorldBounds(true);
        this.opponent.body.setBounce(1, 0);
        this.opponent.body.setVelocityX(100);

        // Grupos de proyectiles
        this.playerBullets = this.physics.add.group();
        this.opponentBullets = this.physics.add.group();

        // Colisiones entre proyectiles y karts
        this.physics.add.overlap(this.playerBullets, this.opponent, this.hitOpponent, null, this);
        this.physics.add.overlap(this.opponentBullets, this.playerContainer, this.hitPlayer, null, this);

        // Configurar controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // Variables para controles en pantalla
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.attackCooldown = false;

        // Crear botones en pantalla (direccionales y de ataque)
        this.createOnScreenControls();

        // Temporizador para ataques del oponente
        this.time.addEvent({
            delay: 2000,
            callback: this.opponentAttack,
            callbackScope: this,
            loop: true
        });

        // Emitir estado inicial de salud para la UI
        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
    }

    createOnScreenControls() {
        // Contenedor de controles direccionales en la esquina inferior izquierda
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

    update(time, delta) {
        const acceleration = 600;
        // Movimiento usando teclado o controles en pantalla
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

        // Revisar condiciones de victoria o derrota
        if (this.opponentHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'player' });
        } else if (this.playerHealth <= 0) {
            this.bgMusic.stop();
            this.scene.start('EndScene', { winner: 'opponent' });
        }

        // Actualizar posición de los proyectiles para reflejar sus gráficos
        this.playerBullets.getChildren().forEach(bullet => { if(bullet.update) bullet.update(); });
        this.opponentBullets.getChildren().forEach(bullet => { if(bullet.update) bullet.update(); });
    }

    playerAttack() {
        if (this.attackCooldown) return;
        this.attackCooldown = true;
        this.sound.play('attackSound');

        // Crear proyectil del jugador
        const bullet = this.playerBullets.create(this.playerContainer.x, this.playerContainer.y, null);
        bullet.setSize(10, 10);
        bullet.displayWidth = 10;
        bullet.displayHeight = 10;
        // Usamos un objeto gráfico para representar el proyectil
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFAA00, 1);
        graphics.fillRect(0, 0, 10, 10);
        bullet.graphics = graphics;
        bullet.graphics.x = this.playerContainer.x;
        bullet.graphics.y = this.playerContainer.y;

        // Calcular dirección hacia el oponente y asignar velocidad
        const direction = new Phaser.Math.Vector2(this.opponent.x - this.playerContainer.x, this.opponent.y - this.playerContainer.y).normalize();
        bullet.body.velocity.x = direction.x * 400;
        bullet.body.velocity.y = direction.y * 400;

        // Actualizar la posición del gráfico en cada frame
        bullet.update = () => {
            bullet.graphics.x = bullet.x;
            bullet.graphics.y = bullet.y;
        };

        // Destruir el proyectil después de 3 segundos
        this.time.delayedCall(3000, () => {
            if (bullet && bullet.graphics) {
                bullet.graphics.destroy();
            }
            bullet.destroy();
        }, [], this);

        // Cooldown de ataque de 1 segundo
        this.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        }, [], this);
    }

    opponentAttack() {
        this.sound.play('attackSound');
        const bullet = this.opponentBullets.create(this.opponent.x, this.opponent.y, null);
        bullet.setSize(10, 10);
        bullet.displayWidth = 10;
        bullet.displayHeight = 10;
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00AAFF, 1);
        graphics.fillRect(0, 0, 10, 10);
        bullet.graphics = graphics;
        bullet.graphics.x = this.opponent.x;
        bullet.graphics.y = this.opponent.y;

        // Disparo dirigido hacia el jugador
        const direction = new Phaser.Math.Vector2(this.playerContainer.x - this.opponent.x, this.playerContainer.y - this.opponent.y).normalize();
        bullet.body.velocity.x = direction.x * 400;
        bullet.body.velocity.y = direction.y * 400;

        bullet.update = () => {
            bullet.graphics.x = bullet.x;
            bullet.graphics.y = bullet.y;
        };

        this.time.delayedCall(3000, () => {
            if (bullet && bullet.graphics) {
                bullet.graphics.destroy();
            }
            bullet.destroy();
        }, [], this);
    }

    hitOpponent(bullet, opponent) {
        if(bullet.graphics) bullet.graphics.destroy();
        bullet.destroy();
        this.sound.play('collisionSound');
        this.opponentHealth -= 20;
        if (this.opponentHealth < 0) this.opponentHealth = 0;
        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
    }

    hitPlayer(bullet, player) {
        if(bullet.graphics) bullet.graphics.destroy();
        bullet.destroy();
        this.sound.play('collisionSound');
        this.playerHealth -= 20;
        if (this.playerHealth < 0) this.playerHealth = 0;
        this.registry.events.emit("updateHealth", { player: this.playerHealth, opponent: this.opponentHealth });
    }
}