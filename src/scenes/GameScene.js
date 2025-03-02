export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Configuración básica del escenario, física y estado del juego
        this.setupScene();
        this.setupPhysics();
        this.createGameObjects();
        this.setupEventListeners();
        this.setupControls();
        this.setupTimers();

        // Inicializar power‑ups de cada lado
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

        // Flag para evitar múltiples llamadas al fin del juego
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
        // Iniciar elementos adicionales (por ejemplo, lanzar la UI)
        this.powerUpIcon = null;
        this.scene.launch("UIScene");
    }

    setupEventListeners() {
        // Colisiones de balas
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

        // Colisiones de power‑ups
        // El jugador recoge power‑ups
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            (player, powerUp) => this.collectPowerUp(player, powerUp),
            null,
            this
        );
        // El oponente también recoge power‑ups
        this.physics.add.overlap(
            this.opponent,
            this.powerUps,
            (opponent, powerUp) => this.collectPowerUpForOpponent(opponent, powerUp),
            null,
            this
        );
    }

    setupControls() {
        // Aquí se ubican y configuran los botones (no se muestran cambios respecto a controles agrandados)
        // Por simplicidad se asume que el botón de ataque llamará a this.handleAttack()
        // … (código de controles ya ajustado en versiones anteriores)
    }

    setupTimers() {
        // Temporizador para spawn de power‑ups
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });
    }

    // --- FUNCIONES DE POWER‑UPS Y MENSAJES ---

    // Muestra un mensaje flotante (cartel) en la posición (x, y)
    showPowerUpMessage(message, x, y) {
        const msg = this.add.text(x, y, message, {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold'
        });
        this.tweens.add({
            targets: msg,
            alpha: 0,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => msg.destroy()
        });
    }

    // Devuelve un mensaje según el tipo de power‑up
    getPowerUpMessage(type) {
        const messages = {
            powerUpDesinformation: '¡Desinformación activada!',
            powerUpRetuits: '¡Retuits activados!',
            powerUpShield: '¡Escudo activado!',
            powerUpHostigamiento: '¡Hostigamiento activado!'
        };
        return messages[type] || '';
    }

    // El jugador recoge un power‑up
    collectPowerUp(player, powerUp) {
        if (this.gameState.playerPowerUp) return; // ya tiene uno
        const type = powerUp.texture.key;
        this.gameState.playerPowerUp = { type };
        this.showPowerUpMessage(this.getPowerUpMessage(type), player.x, player.y - 50);
        powerUp.destroy();
    }

    // El oponente recoge un power‑up
    collectPowerUpForOpponent(opponent, powerUp) {
        if (this.gameState.opponentPowerUp) return;
        const type = powerUp.texture.key;
        this.gameState.opponentPowerUp = { type };
        this.showPowerUpMessage(this.getPowerUpMessage(type), opponent.x, opponent.y - 50);
        powerUp.destroy();
    }

    // --- FUNCIONES DE ATAQUE Y BALAS ---

    // Llama al ataque del jugador (por ejemplo, al presionar el botón de ataque)
    handleAttack() {
        if (this.gameState.attackCooldown || !this.gameState.playerPowerUp) return;
        this.gameState.attackCooldown = true;
        this.sound.play('attackSound');
        // Usar el power‑up recogido para atacar al oponente
        this.attackWithPowerUp('player', this.opponent, this.gameState.playerPowerUp.type);
        this.gameState.playerPowerUp = null;
        this.time.delayedCall(1000, () => { this.gameState.attackCooldown = false; });
    }

    // El oponente ataca automáticamente si tiene power‑up
    opponentAttack() {
        if (this.gameState.opponentAttackCooldown || !this.gameState.opponentPowerUp) return;
        this.gameState.opponentAttackCooldown = true;
        this.sound.play('attackSound');
        this.attackWithPowerUp('opponent', this.player, this.gameState.opponentPowerUp.type);
        this.gameState.opponentPowerUp = null;
        this.time.delayedCall(1000, () => { this.gameState.opponentAttackCooldown = false; });
    }

    // Realiza el ataque según el tipo de power‑up
    attackWithPowerUp(user, target, powerUpType) {
        switch (powerUpType) {
            case 'powerUpDesinformation':
                // Dispara una bala con daño aumentado
                this.createBullet(user, target, { damage: 35, speed: 500 });
                break;
            case 'powerUpRetuits':
                // Dispara tres balas en ráfaga (con ángulos levemente distintos)
                [-10, 0, 10].forEach(angleOffset => {
                    this.createBullet(user, target, { damage: 15, speed: 500, angleOffset });
                });
                break;
            case 'powerUpShield':
                // Activa un escudo temporal (no dispara bala)
                this.activateShield(user);
                break;
            case 'powerUpHostigamiento':
                // Dispara una bala que, al impactar, ralentiza al objetivo
                const bullet = this.createBullet(user, target, { damage: 20, speed: 400 });
                // Se asigna un callback para aplicar el efecto de ralentización
                bullet.setData('hitCallback', (targetSprite) => {
                    this.applySlowEffect(targetSprite);
                });
                break;
            default:
                // Disparo básico por defecto
                this.createBullet(user, target, { damage: 15, speed: 500 });
        }
    }

    // Crea una bala desde el "user" hacia el "target"
    // options: { damage, speed, angleOffset (opcional), texture (opcional) }
    createBullet(user, target, options) {
        const source = (user === 'player') ? this.player : this.opponent;
        const bulletTexture = options.texture || 'bullet'; // Asumir que existe una imagen 'bullet'
        const bullet = (user === 'player')
            ? this.playerBullets.create(source.x, source.y, bulletTexture)
            : this.opponentBullets.create(source.x, source.y, bulletTexture);
        bullet.setScale(0.2);
        bullet.setData('damage', options.damage);

        // Calcular el ángulo entre el origen y el objetivo
        let angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
        if (options.angleOffset) {
            angle += Phaser.Math.DegToRad(options.angleOffset);
        }
        // Asignar velocidad a la bala
        this.physics.velocityFromRotation(angle, options.speed, bullet.body.velocity);

        // Efecto visual (tween de pulsación)
        this.tweens.add({
            targets: bullet,
            scale: 0.25,
            yoyo: true,
            duration: 300,
            repeat: -1
        });

        // Destruir bala tras 3 segundos si no impacta
        this.time.delayedCall(3000, () => {
            if (bullet.active) bullet.destroy();
        });

        return bullet;
    }

    // Activa un escudo que otorga invulnerabilidad temporal
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
        // Mostrar mensaje de escudo
        this.showPowerUpMessage(
            user === 'player' ? '¡Escudo activado!' : '¡Escudo del oponente activado!',
            sprite.x,
            sprite.y - 50
        );
    }

    // Aplica un efecto de "ralentización" al objetivo (por 1 segundo)
    applySlowEffect(targetSprite) {
        // Se reduce la velocidad del cuerpo un 50% temporalmente
        if (targetSprite.body && targetSprite.body.velocity) {
            targetSprite.body.velocity.scale(0.5);
            // (Opcional: se podría restaurar la velocidad original después de 1 segundo)
        }
    }

    // Cuando una bala impacta, se procesa el daño
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

        // Permite actualizar la UI con la nueva salud
        this.registry.events.emit("updateHealth", {
            player: this.gameState.playerHealth,
            opponent: this.gameState.opponentHealth
        });

        // Si la bala tiene callback asignado (por ejemplo, para aplicar el efecto slow), lo ejecuta
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

    // Spawn periódico de power‑ups en posiciones aleatorias
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
        // Efecto fade‑in
        this.tweens.add({
            targets: powerUp,
            alpha: 1,
            duration: 500,
            ease: 'Linear'
        });
        // Animación flotante
        powerUp.tween = this.tweens.add({
            targets: powerUp,
            y: powerUp.y - 30,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

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

        // Actualizar posición (por ejemplo, del icono de power‑up si se muestra)
        if (this.powerUpIcon) {
            this.powerUpIcon.setPosition(this.player.x, this.player.y - 50);
        }

        // Verificar condiciones de fin de juego
        if (this.gameState.opponentHealth <= 0) this.endGame('player');
        if (this.gameState.playerHealth <= 0) this.endGame('opponent');

        // El oponente ataca automáticamente si tiene power‑up
        if (this.gameState.opponentPowerUp) {
            this.opponentAttack();
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