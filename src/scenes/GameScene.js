class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    // Controles virtuales
    this.controlLeft = false;
    this.controlRight = false;
    this.controlUp = false;
    this.controlDown = false; // para frenar
    this.controlAttack = false;
    // Objetivos y estado
    this.enemyHealth = 100;
  }

  create() {
    // Música de fondo
    this.bgMusic = this.sound.add('bgMusic', { volume: 0.4, loop: true });
    this.bgMusic.play();

    // Fondo de la pista: se mueve para dar sensación de velocidad
    this.track = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'trackBg').setOrigin(0);

    // Jugador: escala reducida a ~0.13 (anterior 0.4)
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'playerKart').setScale(0.13);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);
    this.player.setMaxVelocity(200);

    // Enemigo: también con escala 0.13 y con salud
    this.opponent = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'opponentKart').setScale(0.13);
    this.opponent.setCollideWorldBounds(true);
    this.opponent.setVelocityX(100);

    // HUD: Puntuación y salud del enemigo
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', { fontSize: '24px', fill: '#fff' });
    this.enemyHealthText = this.add.text(10, 40, 'Enemigo: 100', { fontSize: '24px', fill: '#ff4444' });

    // Botón de pausa (se mantiene)
    this.pauseText = this.add.text(GAME_WIDTH - 100, 10, 'Pausa', { fontSize: '24px', fill: '#fff' }).setOrigin(0);
    this.pauseText.setInteractive({ useHandCursor: true });
    this.pauseText.on('pointerdown', () => {
      this.sound.play('menuSelect');
      this.scene.launch('PauseScene');
      this.scene.pause();
    });

    // Grupo de power-ups
    this.powerUps = this.physics.add.group();
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });

    // Grupo de obstáculos
    this.obstacles = this.physics.add.group();
    this.time.addEvent({
      delay: 4000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // Colisiones
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    this.physics.add.collider(this.player, this.opponent, this.handleEnemyCollision, null, this);
    this.physics.add.collider(this.player, this.obstacles, this.handleObstacleCollision, null, this);

    // Controles de teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Controles virtuales en pantalla
    this.createVirtualControls();

    // Duración de la carrera: 60 s
    this.time.delayedCall(60000, () => {
      this.bgMusic.stop();
      this.scene.start('EndScene', { score: this.score });
    }, [], this);
  }

  update() {
    // Fondo en movimiento
    this.track.tilePositionY -= 4; // mayor velocidad para sensación de movimiento

    // Actualización de controles (teclado)
    if (this.cursors.left.isDown) { this.player.angle -= 2; }
    if (this.cursors.right.isDown) { this.player.angle += 2; }
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90),
        200,
        this.player.body.acceleration
      );
    } else if (this.cursors.down.isDown || this.controlDown) {
      // Freno: reduciendo la velocidad gradualmente
      this.player.setAcceleration(0);
      this.player.setVelocity(this.player.body.velocity.x * 0.95, this.player.body.velocity.y * 0.95);
    } else {
      this.player.setAcceleration(0);
    }

    // Controles virtuales
    if (this.controlLeft) { this.player.angle -= 2; }
    if (this.controlRight) { this.player.angle += 2; }
    if (this.controlUp) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90),
        200,
        this.player.body.acceleration
      );
    }
    if (this.controlDown) {
      this.player.setAcceleration(0);
      this.player.setVelocity(this.player.body.velocity.x * 0.95, this.player.body.velocity.y * 0.95);
    }

    // Movimiento del oponente: rebote horizontal simple
    if (this.opponent.x >= GAME_WIDTH - 50) {
      this.opponent.setVelocityX(-100);
    } else if (this.opponent.x <= 50) {
      this.opponent.setVelocityX(100);
    }

    // Revisar objetivo: si el enemigo está cerca y se activa ataque, se le quita salud
    // Se puede simular que si el jugador está a menos de 150 px y el ataque está activo, reduce salud
    if (this.controlAttack && Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.opponent.x, this.opponent.y
      ) < 150) {
      this.dealDamageToEnemy(1); // daño por frame de ataque activo
    }
  }

  // Controles virtuales (agregando botón para frenar hacia abajo)
  createVirtualControls() {
    // Botón Izquierda
    const btnLeft = this.add.rectangle(70, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3)
      .setOrigin(0.5).setScrollFactor(0);
    this.add.text(70, GAME_HEIGHT - 70, '←', { fontSize: '32px', fill: '#fff' })
      .setOrigin(0.5).setScrollFactor(0);
    btnLeft.setInteractive();
    btnLeft.on('pointerdown', () => { this.controlLeft = true; });
    btnLeft.on('pointerup', () => { this.controlLeft = false; });
    btnLeft.on('pointerout', () => { this.controlLeft = false; });

    // Botón Derecha
    const btnRight = this.add.rectangle(140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3)
      .setOrigin(0.5).setScrollFactor(0);
    this.add.text(140, GAME_HEIGHT - 70, '→', { fontSize: '32px', fill: '#fff' })
      .setOrigin(0.5).setScrollFactor(0);
    btnRight.setInteractive();
    btnRight.on('pointerdown', () => { this.controlRight = true; });
    btnRight.on('pointerup', () => { this.controlRight = false; });
    btnRight.on('pointerout', () => { this.controlRight = false; });

    // Botón Arriba (Acelerar)
    const btnUp = this.add.rectangle(GAME_WIDTH - 200, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3)
      .setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 200, GAME_HEIGHT - 70, '↑', { fontSize: '32px', fill: '#fff' })
      .setOrigin(0.5).setScrollFactor(0);
    btnUp.setInteractive();
    btnUp.on('pointerdown', () => { this.controlUp = true; });
    btnUp.on('pointerup', () => { this.controlUp = false; });
    btnUp.on('pointerout', () => { this.controlUp = false; });

    // Botón Abajo (Frenar)
    const btnDown = this.add.rectangle(GAME_WIDTH - 140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3)
      .setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 140, GAME_HEIGHT - 70, '↓', { fontSize: '32px', fill: '#fff' })
      .setOrigin(0.5).setScrollFactor(0);
    btnDown.setInteractive();
    btnDown.on('pointerdown', () => { this.controlDown = true; });
    btnDown.on('pointerup', () => { this.controlDown = false; });
    btnDown.on('pointerout', () => { this.controlDown = false; });

    // Botón Ataque
    const btnAttack = this.add.rectangle(GAME_WIDTH - 70, GAME_HEIGHT - 70, 70, 70, 0xff0000, 0.4)
      .setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 70, 'ATAQUE', { fontSize: '16px', fill: '#fff' })
      .setOrigin(0.5).setScrollFactor(0);
    btnAttack.setInteractive();
    btnAttack.on('pointerdown', () => { 
      this.controlAttack = true; 
      this.activateAttack();
    });
    btnAttack.on('pointerup', () => { this.controlAttack = false; });
    btnAttack.on('pointerout', () => { this.controlAttack = false; });
  }

  // Spawn de power-ups en posiciones aleatorias por todo el canvas
  spawnPowerUp() {
    const types = ['powerDesinfo', 'powerRetuits', 'powerShield', 'powerHostigamiento'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const y = Phaser.Math.Between(50, GAME_HEIGHT - 150);
    const powerUp = this.physics.add.sprite(x, y, type).setScale(0.5);
    // Movimiento aleatorio en Y para simular ambiente dinámico
    powerUp.setVelocityY(Phaser.Math.Between(50, 150));
    powerUp.type = type;
    this.powerUps.add(powerUp);
  }

  // Spawn de obstáculos que aparecen en posiciones aleatorias en el canvas
  spawnObstacle() {
    // Crea un obstáculo simple (usamos un rectángulo)
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const y = Phaser.Math.Between(50, GAME_HEIGHT - 150);
    const width = Phaser.Math.Between(30, 60);
    const height = Phaser.Math.Between(30, 60);
    const obstacle = this.add.rectangle(x, y, width, height, 0xffaa00, 1);
    // Añadir física al obstáculo
    this.physics.add.existing(obstacle);
    obstacle.body.setImmovable(true);
    // Agregar al grupo de obstáculos
    this.obstacles.add(obstacle);
    // Movimiento: el obstáculo se mueve hacia abajo para simular movimiento del ambiente
    obstacle.body.setVelocityY(Phaser.Math.Between(50, 100));
    // Destruir cuando sale de la pantalla
    obstacle.body.checkWorldBounds = true;
    obstacle.body.outOfBoundsKill = true;
  }

  collectPowerUp(player, powerUp) {
    this.sound.play('itemPickup');
    let points = 10;
    if (powerUp.type === 'powerDesinfo') points = 15;
    else if (powerUp.type === 'powerRetuits') points = 20;
    else if (powerUp.type === 'powerShield') points = 25;
    else if (powerUp.type === 'powerHostigamiento') points = 30;
    this.score += points;
    this.scoreText.setText('Puntos: ' + this.score);
    powerUp.destroy();
  }

  handleEnemyCollision(player, opponent) {
    this.sound.play('collisionSound');
    // Al chocar con el enemigo se resta puntuación y se da daño al enemigo
    this.score = Math.max(0, this.score - 10);
    this.scoreText.setText('Puntos: ' + this.score);
    this.dealDamageToEnemy(5);
  }

  handleObstacleCollision(player, obstacle) {
    this.sound.play('collisionSound');
    // Penaliza al jugador
    this.score = Math.max(0, this.score - 15);
    this.scoreText.setText('Puntos: ' + this.score);
    obstacle.destroy();
  }

  activateAttack() {
    // Ataque: reproduce sonido, efecto visual y daño al enemigo si está en rango
    this.sound.play('attackSound');
    this.player.setTint(0xff9999);
    this.time.delayedCall(300, () => { this.player.clearTint(); }, [], this);
    // Si el enemigo está cercano, inflige daño extra
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.opponent.x, this.opponent.y) < 150) {
      this.dealDamageToEnemy(10);
    }
    this.score += 5;
    this.scoreText.setText('Puntos: ' + this.score);
  }

  dealDamageToEnemy(amount) {
    this.enemyHealth -= amount;
    if (this.enemyHealth < 0) this.enemyHealth = 0;
    this.enemyHealthText.setText('Enemigo: ' + this.enemyHealth);
    // Si el enemigo es vencido, se detiene y desaparece
    if (this.enemyHealth <= 0) {
      this.opponent.disableBody(true, true);
      // Opción: sumar puntos extra al vencer al enemigo
      this.score += 50;
      this.scoreText.setText('Puntos: ' + this.score);
    }
  }
}
