class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    // Variables para controles virtuales
    this.controlLeft = false;
    this.controlRight = false;
    this.controlUp = false;
    this.controlAttack = false;
    // Pausa
    this.isPaused = false;
  }

  create() {
    // Música de fondo
    this.bgMusic = this.sound.add('bgMusic', { volume: 0.4, loop: true });
    this.bgMusic.play();

    // Fondo de la pista
    this.track = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'trackBg').setOrigin(0);

    // Jugador
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'playerKart').setScale(0.4);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);
    this.player.setMaxVelocity(200);

    // Oponente
    this.opponent = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'opponentKart').setScale(0.4);
    this.opponent.setCollideWorldBounds(true);
    this.opponent.setVelocityX(100);

    // HUD
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', 
      { fontSize: '24px', fill: '#fff' }
    );

    // Botón Pausa
    this.pauseText = this.add.text(GAME_WIDTH - 100, 10, 'Pausa', 
      { fontSize: '24px', fill: '#fff' }
    ).setOrigin(0);
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

    // Colisiones
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    this.physics.add.collider(this.player, this.opponent, this.handleCollision, null, this);

    // Controles de teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Controles virtuales
    this.createVirtualControls();

    // Duración de la carrera (60 s)
    this.time.delayedCall(60000, () => {
      if (!this.isPaused) {
        this.bgMusic.stop();
        this.scene.start('EndScene', { score: this.score });
      }
    }, [], this);
  }

  update() {
    // No moverse si está pausado
    if (this.isPaused) return;

    // Desplazamiento del fondo
    this.track.tilePositionY -= 2;

    // Teclado
    if (this.cursors.left.isDown) { this.player.angle -= 2; }
    if (this.cursors.right.isDown) { this.player.angle += 2; }
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90), 
        200, 
        this.player.body.acceleration
      );
    } else {
      this.player.setAcceleration(0);
    }

    // Controles virtuales
    if (this.controlLeft)  { this.player.angle -= 2; }
    if (this.controlRight) { this.player.angle += 2; }
    if (this.controlUp) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90), 
        200, 
        this.player.body.acceleration
      );
    }

    // Movimiento simple del oponente
    if (this.opponent.x >= GAME_WIDTH - 50) {
      this.opponent.setVelocityX(-100);
    } else if (this.opponent.x <= 50) {
      this.opponent.setVelocityX(100);
    }
  }

  createVirtualControls() {
    // Botón Izquierda
    const btnLeft = this.add.rectangle(70, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3);
    btnLeft.setOrigin(0.5).setScrollFactor(0);
    this.add.text(70, GAME_HEIGHT - 70, '←', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnLeft.setInteractive();
    btnLeft.on('pointerdown', () => { this.controlLeft = true; });
    btnLeft.on('pointerup', () => { this.controlLeft = false; });
    btnLeft.on('pointerout', () => { this.controlLeft = false; });

    // Botón Derecha
    const btnRight = this.add.rectangle(140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3);
    btnRight.setOrigin(0.5).setScrollFactor(0);
    this.add.text(140, GAME_HEIGHT - 70, '→', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnRight.setInteractive();
    btnRight.on('pointerdown', () => { this.controlRight = true; });
    btnRight.on('pointerup', () => { this.controlRight = false; });
    btnRight.on('pointerout', () => { this.controlRight = false; });

    // Botón Arriba (Acelerar)
    const btnUp = this.add.rectangle(GAME_WIDTH - 140, GAME_HEIGHT - 70, 50, 50, 0xffffff, 0.3);
    btnUp.setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 140, GAME_HEIGHT - 70, '↑', 
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnUp.setInteractive();
    btnUp.on('pointerdown', () => { this.controlUp = true; });
    btnUp.on('pointerup', () => { this.controlUp = false; });
    btnUp.on('pointerout', () => { this.controlUp = false; });

    // Botón Ataque
    const btnAttack = this.add.rectangle(GAME_WIDTH - 70, GAME_HEIGHT - 70, 70, 70, 0xff0000, 0.4);
    btnAttack.setOrigin(0.5).setScrollFactor(0);
    this.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 70, 'ATAQUE', 
      { fontSize: '16px', fill: '#fff' }
    ).setOrigin(0.5).setScrollFactor(0);

    btnAttack.setInteractive();
    btnAttack.on('pointerdown', () => { 
      this.controlAttack = true;
      this.activateAttack();
    });
    btnAttack.on('pointerup', () => { this.controlAttack = false; });
    btnAttack.on('pointerout', () => { this.controlAttack = false; });
  }

  spawnPowerUp() {
    const types = ['powerDesinfo', 'powerRetuits', 'powerShield', 'powerHostigamiento'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const powerUp = this.physics.add.sprite(x, 0, type).setScale(0.5);
    powerUp.setVelocityY(Phaser.Math.Between(50, 150));
    powerUp.type = type;
    this.powerUps.add(powerUp);
  }

  collectPowerUp(player, powerUp) {
    this.sound.play('itemPickup');
    let points = 10;
    if (powerUp.type === 'powerDesinfo')      points = 15;
    else if (powerUp.type === 'powerRetuits') points = 20;
    else if (powerUp.type === 'powerShield')  points = 25;
    else if (powerUp.type === 'powerHostigamiento') points = 30;

    this.score += points;
    this.scoreText.setText('Puntos: ' + this.score);
    powerUp.destroy();
  }

  handleCollision(player, opponent) {
    this.sound.play('collisionSound');
    this.score = Math.max(0, this.score - 10);
    this.scoreText.setText('Puntos: ' + this.score);
  }

  activateAttack() {
    // Efecto de ataque: +5 puntos
    this.sound.play('attackSound');
    this.player.setTint(0xff9999);

    this.time.delayedCall(300, () => {
      this.player.clearTint();
    }, [], this);

    this.score += 5;
    this.scoreText.setText('Puntos: ' + this.score);
  }
}
