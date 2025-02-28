class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.controls = {
      left: false,
      right: false,
      up: false,
      down: false,
      attack: false
    };
    this.combat = {
      playerHealth: 100,
      enemyHealth: 100,
      lastAttack: 0,
      attackCooldown: 800
    };
    this.gameVars = {
      score: 0,
      multiplier: 1,
      combo: 0,
      powerUpsActive: []
    };
  }

  create() {
    this.setupWorld();
    this.setupPlayers();
    this.setupUI();
    this.setupEvents();
    this.setupControls();
    this.setupAudio();
  }

  setupWorld() {
    // Fondo animado con efecto de profundidad
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'trackBg')
      .setOrigin(0)
      .setTileScale(0.5, 0.5)
      .setScrollFactor(0, 0.3);
    
    // Efecto de partículas para velocidad
    this.speedParticles = this.add.particles('speedLines');
    this.speedEmitter = this.speedParticles.createEmitter({
      speed: 200,
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      frequency: 50,
      lifespan: 2000
    }).stop();

    // Grupo de power-ups con física mejorada
    this.powerUps = this.physics.add.group({
      collideWorldBounds: true,
      bounceX: 0.8,
      bounceY: 0.8
    });

    // Pool de obstáculos para mejor performance
    this.obstacles = this.add.group({
      classType: Phaser.GameObjects.Rectangle,
      maxSize: 10,
      runChildUpdate: true
    });
  }

  setupPlayers() {
    // Jugador con física arcade mejorada
    this.player = this.physics.add.sprite(GAME_WIDTH/2, GAME_HEIGHT-100, 'playerKart')
      .setScale(0.08)
      .setDrag(0.96)
      .setMaxVelocity(400)
      .setCollideWorldBounds(true)
      .setBounce(0.3);
    
    // Oponente con IA mejorada
    this.opponent = this.physics.add.sprite(GAME_WIDTH/2, 100, 'opponentKart')
      .setScale(0.08)
      .setMaxVelocity(300)
      .setCollideWorldBounds(true)
      .setBounce(0.5);
    
    // Mejora de colisiones
    this.physics.add.collider(this.player, this.opponent, (p1, p2) => {
      this.handleCollision(p1, p2, 8);
    });
    
    this.physics.add.collider(this.player, this.obstacles, (player, obstacle) => {
      this.handleObstacleCollision(player, obstacle, 15);
    });
  }

  setupUI() {
    // HUD estilo panel de trading
    this.createHealthBar(20, 20, this.combat.playerHealth, 0x00ff00, 'TU POPULARIDAD');
    this.createHealthBar(GAME_WIDTH - 220, 20, this.combat.enemyHealth, 0xff0000, 'OPOSICIÓN');
    
    // Score con estilo ticker bursátil
    this.scoreText = this.add.text(GAME_WIDTH/2, 10, `📈 ${this.gameVars.score} PUNTOS\nX${this.gameVars.multiplier}`, {
      fontSize: '24px',
      fill: '#ffd700',
      stroke: '#000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5, 0);
    
    // Botones de control rediseñados
    this.createJoypad();
    this.createAttackButton();
  }

  setupEvents() {
    // Eventos mejorados con gestión de tiempo
    this.powerUpTimer = this.time.addEvent({
      delay: 2500,
      callback: this.spawnSatiricalPowerUp,
      loop: true
    });
    
    this.obstacleTimer = this.time.addEvent({
      delay: 3500,
      callback: this.spawnObstacle,
      loop: true
    });
    
    // Temporizador de partida con actualización visual
    this.gameTimer = this.time.delayedCall(60000, () => this.endGame(), [], this);
    this.createTimerBar();
  }

  update(time) {
    this.updateMovement(time);
    this.updateAI(time);
    this.updateWorldEffects();
    this.updateCombat(time);
    this.updateUI();
  }

  updateMovement() {
    // Movimiento fluido con aceleración progresiva
    const rotationSpeed = 3.5;
    const acceleration = 400;
    
    if (this.controls.left) this.player.angle -= rotationSpeed;
    if (this.controls.right) this.player.angle += rotationSpeed;
    
    if (this.controls.up) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.player.angle - 90),
        acceleration,
        this.player.body.acceleration
      );
      this.speedEmitter.start();
    } else {
      this.player.setAcceleration(0);
      this.speedEmitter.stop();
    }
    
    if (this.controls.down) {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.85,
        this.player.body.velocity.y * 0.85
      );
    }
  }

  updateAI(time) {
    // IA mejorada con seguimiento al jugador
    const distanceToPlayer = Phaser.Math.Distance.BetweenPoints(this.opponent, this.player);
    
    if (distanceToPlayer > 300) {
      this.physics.moveToObject(this.opponent, this.player, 250);
    } else if (distanceToPlayer < 150) {
      this.opponent.setVelocity(-this.opponent.body.velocity.x, -this.opponent.body.velocity.y);
    }
    
    // Ataques con diferentes patrones
    if (time > this.combat.lastAttack + this.combat.attackCooldown) {
      this.enemyAttack(time);
      this.combat.lastAttack = time;
      this.combat.attackCooldown = Phaser.Math.Between(800, 1200);
    }
  }

  spawnSatiricalPowerUp() {
    const powerUps = [
      { type: 'dolar', texture: 'dolarSprite', effect: 'addScore', value: 50 },
      { type: 'fakeNews', texture: 'fakeNews', effect: 'confuseEnemy' },
      { type: 'libertad', texture: 'libertadShield', effect: 'shield' },
      { type: 'impuesto', texture: 'taxBomb', effect: 'penalty' }
    ];
    
    const powerUp = Phaser.Utils.Array.GetRandom(powerUps);
    const x = Phaser.Math.Between(50, GAME_WIDTH-50);
    const y = Phaser.Math.Between(50, GAME_HEIGHT-50);
    
    const sprite = this.physics.add.sprite(x, y, powerUp.texture)
      .setScale(0.3)
      .setData('powerData', powerUp)
      .setVelocityY(Phaser.Math.Between(80, 120));
    
    this.powerUps.add(sprite);
    
    this.physics.add.overlap(this.player, sprite, (player, power) => {
      this.applyPowerUp(power.getData('powerData'));
      power.destroy();
    });
  }

  applyPowerUp(power) {
    const effects = {
      addScore: () => {
        this.gameVars.score += power.value * this.gameVars.multiplier;
        this.showFloatingText(`+${power.value} ${power.type.toUpperCase()}`, 0x00ff00);
      },
      confuseEnemy: () => {
        this.opponent.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-300, 300));
        this.showFloatingText('FAKE NEWS!', 0xff0000);
      },
      shield: () => {
        this.player.setTint(0x00ffff);
        this.time.delayedCall(3000, () => this.player.clearTint());
      },
      penalty: () => {
        this.gameVars.score = Math.max(0, this.gameVars.score - 100);
        this.showFloatingText('-100 IMPUESTOS!', 0xff0000);
      }
    };
    
    effects[power.effect]?.();
    this.sound.play('powerUp');
  }

  enemyAttack(time) {
    const attackTypes = ['melee', 'ranged', 'area'];
    const attack = Phaser.Utils.Array.GetRandom(attackTypes);
    
    switch(attack) {
      case 'melee':
        if (Phaser.Math.Distance.BetweenPoints(this.player, this.opponent) < 200) {
          this.handleCollision(this.player, this.opponent, 15);
        }
        break;
        
      case 'ranged':
        const projectile = this.physics.add.sprite(this.opponent.x, this.opponent.y, 'attackSprite')
          .setVelocityY(500)
          .setScale(0.1);
        this.physics.add.overlap(this.player, projectile, () => {
          this.dealDamageToPlayer(10);
          projectile.destroy();
        });
        break;
    }
    
    this.opponent.setTint(0xff0000);
    this.time.delayedCall(200, () => this.opponent.clearTint());
    this.sound.play('enemyAttack');
  }

  createJoypad() {
    // Joystick virtual rediseñado
    const joyBase = this.add.circle(GAME_WIDTH - 100, GAME_HEIGHT - 100, 40, 0xffffff, 0.3)
      .setInteractive();
    const joyHandle = this.add.circle(joyBase.x, joyBase.y, 20, 0xffffff, 0.5);
    
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      const vec = new Phaser.Math.Vector2(dragX - joyBase.x, dragY - joyBase.y);
      const angle = vec.angle();
      const distance = Math.min(vec.length(), 40);
      
      joyHandle.setPosition(
        joyBase.x + Math.cos(angle) * distance,
        joyBase.y + Math.sin(angle) * distance
      );
      
      this.player.angle = Phaser.Math.RadToDeg(angle) + 90;
      this.controls.up = distance > 10;
    });
    
    this.input.on('dragend', () => {
      joyHandle.setPosition(joyBase.x, joyBase.y);
      this.controls.up = false;
    });
  }

  showFloatingText(text, color) {
    const textObj = this.add.text(this.player.x, this.player.y - 50, text, {
      fontSize: '20px',
      fill: `#${color.toString(16)}`,
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: textObj,
      y: textObj.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => textObj.destroy()
    });
  }
}
