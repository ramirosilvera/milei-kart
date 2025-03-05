export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // Cargamos assets propios del juego (el fondo se carga en CircuitScene)
    this.load.image("mileiKart", "assets/mileiKart.png");
    this.load.image("opponentKart", "assets/opponentKart.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("powerUpDesinformation", "assets/powerUpDesinformation.png");
    this.load.image("powerUpRetuits", "assets/powerUpRetuits.png");
    this.load.image("powerUpShield", "assets/powerUpShield.png");
    this.load.image("powerUpHostigamiento", "assets/powerUpHostigamiento.png");
    this.load.image("spark", "assets/spark.png");
    this.load.audio("bgMusic", "assets/bgMusic.mp3");
    this.load.audio("attackSound", "assets/attackSound.mp3");
  }

  create() {
    // Configuramos el mundo para que coincida con el circuito
    const worldWidth = 2000;
    const worldHeight = 2000;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Inicializamos variables de juego y circuito
    this.gameState = {
      playerHealth: 100,
      opponentHealth: 100,
      // Vector del joystick para el movimiento analógico
      joystickVector: new Phaser.Math.Vector2(0, 0),
      playerInvulnerable: false,
      opponentInvulnerable: false,
      playerPowerUp: null,
      opponentPowerUp: null,
      attackCooldown: false,
      opponentAttackCooldown: false,
      lapCount: 0,
      // Según dificultad: 3, 5 o 7 vueltas; aquí usamos 3 como ejemplo
      requiredLaps: 3,
    };
    this.crossedFinishLine = false; // Bandera para evitar contar múltiples vueltas seguidas

    // Creamos la UI para mostrar las vueltas (se mantiene fija en pantalla)
    this.lapText = this.add.text(20, 20, `Vueltas: 0/${this.gameState.requiredLaps}`, {
      fontSize: "30px",
      fill: "#ffffff",
      fontStyle: "bold"
    });
    this.lapText.setScrollFactor(0);

    // Iniciamos la música de fondo
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();

    // Creamos los karts y configuramos la física
    this.setupPhysics();
    this.setupControls();
    this.setupTimers();

    // Recuperamos la zona de la línea de meta (definida en CircuitScene)
    this.finishLine = this.registry.get("finishLine");

    // Revisamos los power ups de forma periódica
    this.time.addEvent({
      delay: 500,
      callback: this.checkPowerUpCollections,
      callbackScope: this,
      loop: true,
    });

    // Configuramos la cámara para que siga al jugador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  setupPhysics() {
    // Posicionamos los karts en el circuito (por ejemplo, cerca de la línea de meta)
    this.player = this.physics.add.sprite(1000, 1750, "mileiKart")
      .setScale(0.1)
      .setCollideWorldBounds(true)
      .setDrag(600, 600)
      .setMaxVelocity(300);

    this.opponent = this.physics.add.sprite(1050, 1750, "opponentKart")
      .setScale(0.1)
      .setBounce(1, 0)
      .setCollideWorldBounds(true);

    // Agrandamos la zona de colisión para mayor precisión
    this.player.body.setCircle(this.player.displayWidth * 0.6);
    this.opponent.body.setCircle(this.opponent.displayWidth * 0.6);

    this.powerUps = this.physics.add.group();
  }

  setupControls() {
    this.setupJoystick();
    this.setupAttackButton();
  }

  // --- Joystick virtual (palanca) ---
  setupJoystick() {
    const baseX = 100,
      baseY = this.cameras.main.height - 100;
    const baseRadius = 80;

    this.joystickBase = this.add.circle(baseX, baseY, baseRadius, 0x444444, 0.8)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(1)
      .setStrokeStyle(4, 0xffffff);
    this.joystickBaseRadius = baseRadius;

    const knobRadius = 40;
    this.joystickKnob = this.add.circle(baseX, baseY, knobRadius, 0xee1111, 0.9)
      .setScrollFactor(0)
      .setDepth(2)
      .setStrokeStyle(2, 0xffffff);

    this.gameState.joystickVector = new Phaser.Math.Vector2(0, 0);
    this.joystickActive = false;

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

    const normX = (knobX - baseX) / maxDistance;
    const normY = (knobY - baseY) / maxDistance;
    this.gameState.joystickVector.set(normX, normY);
  }
  // --- Fin joystick ---

  setupAttackButton() {
    const btnX = this.cameras.main.width - 100,
      btnY = this.cameras.main.height - 100;
    const radius = 60;
    this.attackButton = this.add.circle(btnX, btnY, radius, 0xff4444, 0.8).setInteractive();
    this.add.text(btnX, btnY, "ATACAR", {
      fontSize: "20px",
      fill: "#fff",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.attackButton.on("pointerdown", () => {
      this.tweens.add({
        targets: this.attackButton,
        scale: 0.9,
        duration: 100,
        ease: "Power1",
        onComplete: () => {
          this.handleAttack();
        },
      });
    });
    this.attackButton.on("pointerup", () => {
      this.tweens.add({
        targets: this.attackButton,
        scale: 1,
        duration: 100,
        ease: "Power1",
      });
    });
  }

  setupTimers() {
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true,
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    const acceleration = 600;
    const vec = this.gameState.joystickVector;
    this.player.setAccelerationX(vec.x * acceleration);
    this.player.setAccelerationY(vec.y * acceleration);

    // Actualizamos el comportamiento del oponente
    this.opponentBehavior();

    // Verificamos si el jugador cruza la línea de meta
    if (this.finishLine) {
      // Usamos el centro del jugador para detectar la intersección
      const playerCenter = this.player.getCenter();
      if (Phaser.Geom.Rectangle.ContainsPoint(this.finishLine, playerCenter)) {
        if (!this.crossedFinishLine) {
          this.gameState.lapCount++;
          this.lapText.setText(`Vueltas: ${this.gameState.lapCount}/${this.gameState.requiredLaps}`);
          this.showPowerUpMessage("¡Vuelta completada!", this.player.x, this.player.y - 50);
          this.crossedFinishLine = true;
          // Si se alcanzan las vueltas requeridas, se finaliza la carrera
          if (this.gameState.lapCount >= this.gameState.requiredLaps) {
            this.endGame("player");
          }
        }
      } else {
        this.crossedFinishLine = false;
      }
    }

    if (this.gameState.playerHealth <= 0) this.endGame("opponent");
    if (this.gameState.opponentHealth <= 0) this.endGame("player");
  }

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
      },
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
      opponent: this.gameState.opponentHealth,
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
        [-10, 0, 10].forEach(() => {
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
      },
    });
    this.showPowerUpMessage(
      user === "player"
        ? "¡EXCLUSIVO! ¡Escudo activado!"
        : "¡URGENTE! ¡Escudo del oponente activado!",
      sprite.x,
      sprite.y - 50
    );
  }

  checkPowerUpCollections() {
    const collectThreshold = 40;
    this.powerUps.getChildren().forEach((powerUp) => {
      if (!powerUp.active) return;
      let dPlayer = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.player.x, this.player.y);
      if (dPlayer < collectThreshold && !this.gameState.playerPowerUp) {
        this.collectPowerUp(this.player, powerUp);
      }
      let dOpponent = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.opponent.x, this.opponent.y);
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
      powerUpDesinformation: "¡EXCLUSIVO! ¡Desinformación activada!",
      powerUpRetuits: "¡URGENTE! ¡Retuits activados!",
      powerUpShield: "¡ALERTA! ¡Escudo activado!",
      powerUpHostigamiento: "¡IMPACTANTE! ¡Hostigamiento activado!",
    };
    return messages[type] || "¡POWERUP ACTIVADO!";
  }

  showPowerUpMessage(message, x, y) {
    const msg = this.add.text(x, y, message, {
      fontSize: "40px",
      fill: "#ffcc00",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: msg,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: "Power1",
      onComplete: () => msg.destroy(),
    });
  }

  spawnPowerUp() {
    const types = [
      "powerUpDesinformation",
      "powerUpRetuits",
      "powerUpShield",
      "powerUpHostigamiento",
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
      repeat: -1,
    });
  }

  opponentBehavior() {
    // Comportamiento del oponente:
    // - Si el jugador tiene power up, intenta escapar.
    // - Si el oponente tiene power up, persigue al jugador.
    // - De lo contrario, persigue el power up más cercano o patrulla.
    if (this.gameState.playerPowerUp) {
      const dx = this.opponent.x - this.player.x;
      const dy = this.opponent.y - this.player.y;
      const angle = Math.atan2(dy, dx);
      this.physics.velocityFromRotation(angle, 120, this.opponent.body.velocity);
    } else if (this.gameState.opponentPowerUp) {
      this.physics.moveToObject(this.opponent, this.player, 150);
      let d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, this.player.x, this.player.y);
      if (d < 300) {
        this.opponentAttack();
      }
    } else {
      let activePowerUps = this.powerUps.getChildren().filter(pu => pu.active);
      if (activePowerUps.length > 0) {
        let closestPowerUp = null;
        let closestDistance = Infinity;
        activePowerUps.forEach(pu => {
          let d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, pu.x, pu.y);
          if (d < closestDistance) {
            closestDistance = d;
            closestPowerUp = pu;
          }
        });
        if (closestPowerUp) {
          this.physics.moveToObject(this.opponent, closestPowerUp, 80);
        }
      } else {
        if (!this.opponentPatrolTarget ||
            Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, this.opponentPatrolTarget.x, this.opponentPatrolTarget.y) < 10) {
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
    // Se finaliza la partida; por ejemplo, se puede iniciar una EndScene pasando el ganador
    this.scene.start("EndScene", { winner });
  }
}