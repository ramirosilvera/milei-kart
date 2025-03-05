export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // Cargamos imágenes desde assets/images
    this.load.image("mileiKart", "assets/images/mileiKart.png");
    this.load.image("opponentKart", "assets/images/opponentKart.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("powerUpDesinformation", "assets/images/powerUpDesinformation.png");
    this.load.image("powerUpRetuits", "assets/images/powerUpRetuits.png");
    this.load.image("powerUpShield", "assets/images/powerUpShield.png");
    this.load.image("powerUpHostigamiento", "assets/images/powerUpHostigamiento.png");

    // Cargamos sonidos desde assets/sounds
    this.load.audio("bgMusic", "assets/sounds/bgMusic.mp3");
    this.load.audio("attackSound", "assets/sounds/attackSound.mp3");
    this.load.audio("motorSound", "assets/sounds/motor.mp3"); // Sonido del motor
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 2000;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Estado del juego
    this.gameState = {
      playerHealth: 100,
      opponentHealth: 100,
      joystickVector: new Phaser.Math.Vector2(0, 0),
      playerInvulnerable: false,
      opponentInvulnerable: false,
      playerPowerUp: null,
      opponentPowerUp: null,
      attackCooldown: false,
      opponentAttackCooldown: false,
      lapCount: 0,
      requiredLaps: 3 // Ajusta a 5 o 7 para mayor dificultad
    };
    this.gameOver = false;
    this.crossedFinishLine = false;

    // Texto de vueltas, siempre visible
    this.lapText = this.add.text(20, 20, `Vueltas: 0/${this.gameState.requiredLaps}`, {
      fontSize: "24px",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4,
    }).setScrollFactor(0);

    // Música de fondo
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();

    // Sonido del motor (con volumen bajo para no generar contaminación auditiva)
    this.playerMotorSound = this.sound.add("motorSound", { loop: true, volume: 0.2 });

    // Configuramos los karts y la física
    this.setupPhysics();
    this.setupControls();
    this.setupTimers();
    this.createObstacles();

    // Recuperamos la zona de la línea de meta (definida en CircuitScene)
    this.finishLine = this.registry.get("finishLine");

    // Comprobación periódica de power ups
    this.time.addEvent({
      delay: 500,
      callback: this.checkPowerUpCollections,
      callbackScope: this,
      loop: true,
    });

    // La cámara sigue al jugador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // Envía al fondo la escena del circuito si se está ejecutando en paralelo
    if (this.scene.isActive("CircuitScene")) {
      this.scene.sendToBack("CircuitScene");
    }
  }

  setupPhysics() {
    // Posicionamos los karts cerca de la línea de meta para iniciar la carrera (en la parte inferior)
    this.player = this.physics.add.sprite(1000, 1750, "mileiKart")
      .setScale(0.1)
      .setCollideWorldBounds(true)
      .setDrag(600, 600)
      .setMaxVelocity(300);

    this.opponent = this.physics.add.sprite(1050, 1750, "opponentKart")
      .setScale(0.1)
      .setBounce(1, 0)
      .setCollideWorldBounds(true);

    // Aumentamos la zona de colisión
    this.player.body.setCircle(this.player.displayWidth * 0.6);
    this.opponent.body.setCircle(this.opponent.displayWidth * 0.6);

    // Grupo para power ups
    this.powerUps = this.physics.add.group();
  }

  setupControls() {
    this.setupJoystick();
    this.setupAttackButton();
  }

  setupJoystick() {
    const baseX = 100;
    const baseY = this.cameras.main.height - 100;
    const baseRadius = 80;

    // Base del joystick (fijo en pantalla)
    this.joystickBase = this.add.circle(baseX, baseY, baseRadius, 0x444444, 0.8)
      .setDepth(1)
      .setStrokeStyle(4, 0xffffff)
      .setScrollFactor(0);

    this.joystickBaseRadius = baseRadius;

    // Knob del joystick (fijo en pantalla)
    const knobRadius = 40;
    this.joystickKnob = this.add.circle(baseX, baseY, knobRadius, 0xee1111, 0.9)
      .setDepth(2)
      .setStrokeStyle(2, 0xffffff)
      .setScrollFactor(0);

    this.joystickActive = false;

    // Eventos para actualizar el joystick
    this.input.on("pointerdown", (pointer) => {
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
      if (dist <= baseRadius) {
        this.joystickActive = true;
        this.updateJoystick(pointer);
      }
    });

    this.input.on("pointermove", (pointer) => {
      if (this.joystickActive) {
        this.updateJoystick(pointer);
      }
    });

    this.input.on("pointerup", () => {
      this.joystickActive = false;
      this.gameState.joystickVector.set(0, 0);
      this.joystickKnob.setPosition(baseX, baseY);
    });
  }

  updateJoystick(pointer) {
    const baseX = this.joystickBase.x;
    const baseY = this.joystickBase.y;
    const maxDistance = this.joystickBaseRadius;

    const dx = pointer.x - baseX;
    const dy = pointer.y - baseY;
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    const knobX = baseX + clampedDistance * Math.cos(angle);
    const knobY = baseY + clampedDistance * Math.sin(angle);
    this.joystickKnob.setPosition(knobX, knobY);

    // Calculamos el vector normalizado
    const normX = (knobX - baseX) / maxDistance;
    const normY = (knobY - baseY) / maxDistance;
    this.gameState.joystickVector.set(normX, normY);
  }

  setupAttackButton() {
    const btnX = this.cameras.main.width - 100;
    const btnY = this.cameras.main.height - 100;
    const radius = 60;

    // Botón de ataque (fijo en pantalla)
    this.attackButton = this.add.circle(btnX, btnY, radius, 0xff4444, 0.8)
      .setScrollFactor(0)
      .setDepth(2)
      .setInteractive();

    const buttonText = this.add.text(btnX, btnY, "ATACAR", {
      fontSize: "20px",
      fill: "#fff",
      fontStyle: "bold"
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);

    // Efecto de pulsación y manejo del ataque
    this.attackButton.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.attackButton, buttonText],
        scale: 0.9,
        duration: 100,
        ease: "Power1",
        onComplete: () => {
          this.handleAttack();
        }
      });
    });
    this.attackButton.on("pointerup", () => {
      this.tweens.add({
        targets: [this.attackButton, buttonText],
        scale: 1,
        duration: 100,
        ease: "Power1"
      });
    });
  }

  setupTimers() {
    // Aparece un power up cada 5 segundos
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });
  }

  createObstacles() {
    // Creamos obstáculos estáticos en la pista para aumentar el desafío
    this.obstacles = [];
    const obstaclesData = [
      { x: 1000, y: 1300, width: 100, height: 30 },
      { x: 800, y: 1000, width: 80, height: 80 },
      { x: 1200, y: 800, width: 50, height: 150 }
    ];

    obstaclesData.forEach(data => {
      const obstacle = this.add.rectangle(data.x, data.y, data.width, data.height, 0x666666);
      // Hacemos que el obstáculo sea parte de la física estática
      this.physics.add.existing(obstacle, true);
      this.obstacles.push(obstacle);

      // Añadimos colisión entre los karts y el obstáculo
      this.physics.add.collider(this.player, obstacle);
      this.physics.add.collider(this.opponent, obstacle);
    });
  }

  update() {
    if (this.gameOver) return;

    // Reproducir sonido del motor cuando el jugador se mueve
    if (this.gameState.joystickVector.length() > 0.1) {
      if (!this.playerMotorSound.isPlaying) {
        this.playerMotorSound.play();
      }
    } else {
      if (this.playerMotorSound.isPlaying) {
        this.playerMotorSound.stop();
      }
    }

    // Movimiento del jugador según el vector del joystick
    const acceleration = 600;
    const vec = this.gameState.joystickVector;
    this.player.setAccelerationX(vec.x * acceleration);
    this.player.setAccelerationY(vec.y * acceleration);

    // Comportamiento del oponente
    this.opponentBehavior();

    // Verificación de la línea de meta
    if (this.finishLine) {
      const playerCenter = this.player.getCenter();
      if (Phaser.Geom.Rectangle.ContainsPoint(this.finishLine.getBounds(), playerCenter)) {
        if (!this.crossedFinishLine) {
          this.gameState.lapCount++;
          this.lapText.setText(`Vueltas: ${this.gameState.lapCount}/${this.gameState.requiredLaps}`);
          this.showPowerUpMessage("¡Vuelta completada!", this.player.x, this.player.y - 50);
          this.crossedFinishLine = true;
          if (this.gameState.lapCount >= this.gameState.requiredLaps) {
            this.endGame("player");
          }
        }
      } else {
        this.crossedFinishLine = false;
      }
    }

    // Verificación de la salud
    if (this.gameState.playerHealth <= 0) this.endGame("opponent");
    if (this.gameState.opponentHealth <= 0) this.endGame("player");
  }

  // --- Disparo y manejo de daño ---
  fireBullet(user, target, options) {
    const source = user === "player" ? this.player : this.opponent;
    const bulletSpeed = options.speed;
    const startX = source.x;
    const startY = source.y;
    const targetX = target.x;
    const targetY = target.y;
    const distance = Phaser.Math.Distance.Between(startX, startY, targetX, targetY);
    const timeToHit = (distance / bulletSpeed) * 1000;

    const bullet = this.add.sprite(startX, startY, options.texture || "bullet");
    bullet.setScale(0.4);

    this.tweens.add({
      targets: bullet,
      x: targetX,
      y: targetY,
      duration: timeToHit,
      ease: "Linear",
      onComplete: () => {
        bullet.destroy();
        const currentDistance = Phaser.Math.Distance.Between(
          targetX,
          targetY,
          target.x,
          target.y
        );
        const HITBOX_RADIUS = 40;
        if (currentDistance <= HITBOX_RADIUS) {
          this.applyDamage(target, options.damage);
        }
      }
    });
  }

  applyDamage(target, damage) {
    if (target === this.player && this.gameState.playerInvulnerable) return;
    if (target === this.opponent && this.gameState.opponentInvulnerable) return;

    if (target === this.player) {
      this.gameState.playerHealth = Phaser.Math.Clamp(
        this.gameState.playerHealth - damage,
        0,
        100
      );
    } else {
      this.gameState.opponentHealth = Phaser.Math.Clamp(
        this.gameState.opponentHealth - damage,
        0,
        100
      );
    }

    this.registry.events.emit("updateHealth", {
      player: this.gameState.playerHealth,
      opponent: this.gameState.opponentHealth
    });

    target.setTint(0xff0000);
    this.time.delayedCall(300, () => {
      target.clearTint();
    });
  }

  handleAttack() {
    if (this.gameState.attackCooldown || !this.gameState.playerPowerUp) return;
    this.gameState.attackCooldown = true;
    this.sound.play("attackSound");
    this.attackWithPowerUp("player", this.opponent, this.gameState.playerPowerUp.type);
    this.gameState.playerPowerUp = null;
    this.time.delayedCall(1000, () => {
      this.gameState.attackCooldown = false;
    });
  }

  opponentAttack() {
    if (this.gameState.opponentAttackCooldown || !this.gameState.opponentPowerUp) return;
    this.gameState.opponentAttackCooldown = true;
    this.sound.play("attackSound");
    this.attackWithPowerUp("opponent", this.player, this.gameState.opponentPowerUp.type);
    this.gameState.opponentPowerUp = null;
    this.time.delayedCall(1000, () => {
      this.gameState.opponentAttackCooldown = false;
    });
  }

  attackWithPowerUp(user, target, powerUpType) {
    switch (powerUpType) {
      case "powerUpDesinformation":
        this.fireBullet(user, target, { damage: 35, speed: 500, texture: powerUpType });
        break;
      case "powerUpRetuits":
        // Lanza varios disparos con ligeros ángulos
        [-15, 0, 15].forEach(() => {
          this.fireBullet(user, target, { damage: 15, speed: 500, texture: powerUpType });
        });
        break;
      case "powerUpShield":
        this.activateShield(user);
        break;
      case "powerUpHostigamiento":
        this.fireBullet(user, target, { damage: 20, speed: 400, texture: powerUpType });
        break;
      default:
        this.fireBullet(user, target, { damage: 15, speed: 500, texture: powerUpType });
    }
  }

  activateShield(user) {
    const sprite = user === "player" ? this.player : this.opponent;
    if (user === "player") {
      this.gameState.playerInvulnerable = true;
    } else {
      this.gameState.opponentInvulnerable = true;
    }
    const shield = this.add.circle(sprite.x, sprite.y, 40, 0x00ffff, 0.3);
    this.tweens.add({
      targets: shield,
      alpha: 0,
      duration: 1000,
      ease: "Power1",
      onComplete: () => {
        shield.destroy();
        if (user === "player") {
          this.gameState.playerInvulnerable = false;
        } else {
          this.gameState.opponentInvulnerable = false;
        }
      }
    });
    this.showPowerUpMessage(
      user === "player"
        ? "¡Escudo activado!"
        : "¡Escudo del oponente activado!",
      sprite.x,
      sprite.y - 50
    );
  }

  // --- Manejo de power ups ---
  checkPowerUpCollections() {
    const collectThreshold = 40;
    this.powerUps.getChildren().forEach((powerUp) => {
      if (!powerUp.active) return;
      const dPlayer = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.player.x, this.player.y);
      if (dPlayer < collectThreshold && !this.gameState.playerPowerUp) {
        this.collectPowerUp(this.player, powerUp);
      }
      const dOpponent = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.opponent.x, this.opponent.y);
      if (dOpponent < collectThreshold && !this.gameState.opponentPowerUp) {
        this.collectPowerUpForOpponent(this.opponent, powerUp);
      }
    });
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

  getPowerUpMessage(type) {
    const messages = {
      powerUpDesinformation: "¡Desinformación activada!",
      powerUpRetuits: "¡Retuits activados!",
      powerUpShield: "¡Escudo activado!",
      powerUpHostigamiento: "¡Hostigamiento activado!"
    };
    return messages[type] || "¡POWERUP ACTIVADO!";
  }

  showPowerUpMessage(message, x, y) {
    const msg = this.add.text(x, y, message, {
      fontSize: "24px",
      fill: "#ffcc00",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: msg,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: "Power1",
      onComplete: () => msg.destroy()
    });
  }

  spawnPowerUp() {
    const types = [
      "powerUpDesinformation",
      "powerUpRetuits",
      "powerUpShield",
      "powerUpHostigamiento"
    ];
    const randomType = Phaser.Utils.Array.GetRandom(types);
    const powerUp = this.powerUps.create(
      Phaser.Math.Between(100, 1900),
      Phaser.Math.Between(100, 1900),
      randomType
    )
      .setScale(0.2)
      .setAlpha(1);

    this.tweens.add({
      targets: powerUp,
      y: powerUp.y - 30,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  // --- Comportamiento del oponente ---
  opponentBehavior() {
    if (this.gameState.playerPowerUp) {
      const dx = this.opponent.x - this.player.x;
      const dy = this.opponent.y - this.player.y;
      const angle = Math.atan2(dy, dx);
      this.physics.velocityFromRotation(angle, 120, this.opponent.body.velocity);
    } else if (this.gameState.opponentPowerUp) {
      this.physics.moveToObject(this.opponent, this.player, 150);
      const d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, this.player.x, this.player.y);
      if (d < 300) {
        this.opponentAttack();
      }
    } else {
      const activePowerUps = this.powerUps.getChildren().filter(pu => pu.active);
      if (activePowerUps.length > 0) {
        let closestPowerUp = null;
        let closestDistance = Infinity;
        activePowerUps.forEach(pu => {
          const dist = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, pu.x, pu.y);
          if (dist < closestDistance) {
            closestDistance = dist;
            closestPowerUp = pu;
          }
        });
        if (closestPowerUp) {
          this.physics.moveToObject(this.opponent, closestPowerUp, 80);
        }
      } else {
        if (!this.opponentPatrolTarget ||
            Phaser.Math.Distance.Between(
              this.opponent.x,
              this.opponent.y,
              this.opponentPatrolTarget.x,
              this.opponentPatrolTarget.y
            ) < 10) {
          const margin = 50;
          const x = Phaser.Math.Between(margin, 1950);
          const y = Phaser.Math.Between(margin, 1950);
          this.opponentPatrolTarget = new Phaser.Math.Vector2(x, y);
        }
        this.physics.moveToObject(this.opponent, this.opponentPatrolTarget, 80);
      }
    }
  }

  endGame(winner) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.bgMusic.stop();
    // Asegúrate de tener definida la escena "EndScene" o modifica esta parte
    this.scene.start("EndScene", { winner });
  }
}

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.uiContainer = this.add.container(0, 0);

    // Barra de salud del jugador (esquina superior izquierda)
    const playerHealthBg = this.add.rectangle(50, 20, 300, 50, 0x000000, 0.7).setOrigin(0);
    this.playerHealthBar = this.add.rectangle(50, 20, 300, 50, 0x00ff00).setOrigin(0);
    const playerHealthText = this.add.text(60, 30, "Jugador: 100", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
    });

    // Barra de salud del oponente (esquina superior derecha)
    const opponentHealthBg = this.add.rectangle(this.cameras.main.width - 350, 20, 300, 50, 0x000000, 0.7).setOrigin(0);
    this.opponentHealthBar = this.add.rectangle(this.cameras.main.width - 350, 20, 300, 50, 0xff0000).setOrigin(0);
    const opponentHealthText = this.add.text(this.cameras.main.width - 340, 30, "Oponente: 100", {
      fontSize: "28px",
      fill: "#ffffff",
      fontStyle: "bold",
    });

    this.uiContainer.add([
      playerHealthBg,
      this.playerHealthBar,
      playerHealthText,
      opponentHealthBg,
      this.opponentHealthBar,
      opponentHealthText,
    ]);

    this.playerHealthText = playerHealthText;
    this.opponentHealthText = opponentHealthText;

    this.registry.events.on("updateHealth", (data) => {
      const playerWidth = (data.player / 100) * 300;
      this.playerHealthBar.width = playerWidth;
      this.playerHealthText.setText("Jugador: " + data.player);

      const opponentWidth = (data.opponent / 100) * 300;
      this.opponentHealthBar.width = opponentWidth;
      this.opponentHealthText.setText("Oponente: " + data.opponent);
    });
  }
}
