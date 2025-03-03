export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("track", "assets/track.png");
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
    this.setupScene();
    this.setupPhysics();
    this.setupControls();
    this.setupTimers();

    this.gameState.playerPowerUp = null;
    this.gameState.opponentPowerUp = null;
    this.gameState.attackCooldown = false;
    this.gameState.opponentAttackCooldown = false;

    this.scene.launch("UIScene");

    this.time.addEvent({
      delay: 500,
      callback: this.checkPowerUpCollections,
      callbackScope: this,
      loop: true,
    });
  }

  setupScene() {
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "track")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();

    this.gameState = {
      playerHealth: 100,
      opponentHealth: 100,
      // Vector del joystick para el movimiento analógico
      joystickVector: new Phaser.Math.Vector2(0, 0),
      playerInvulnerable: false,
      opponentInvulnerable: false,
    };
    this.gameOver = false;
  }

  setupPhysics() {
    this.player = this.physics.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      "mileiKart"
    )
      .setScale(0.1)
      .setCollideWorldBounds(true)
      .setDrag(600, 600)
      .setMaxVelocity(300);

    this.opponent = this.physics.add.sprite(
      this.cameras.main.centerX,
      100,
      "opponentKart"
    )
      .setScale(0.1)
      .setBounce(1, 0)
      .setCollideWorldBounds(true)
      .setVelocityX(100);

    this.powerUps = this.physics.add.group();
  }

  setupControls() {
    this.setupJoystick();
    this.setupAttackButton();
  }

  // --- Joystick virtual (palanca deslizante) ---
  setupJoystick() {
    const baseX = 100,
      baseY = this.cameras.main.height - 100;
    const baseRadius = 60; // Radio de la base del joystick

    // Crea la base circular del joystick
    this.joystickBase = this.add.circle(baseX, baseY, baseRadius, 0x888888, 0.6)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(1);
    // Guarda el radio para usarlo al limitar el movimiento
    this.joystickBaseRadius = baseRadius;

    // Crea el knob (palanca) más pequeño
    const knobRadius = 30;
    this.joystickKnob = this.add.circle(baseX, baseY, knobRadius, 0xcccccc, 0.8)
      .setScrollFactor(0)
      .setDepth(2);

    // Inicializa el vector del joystick y bandera de activación
    this.gameState.joystickVector = new Phaser.Math.Vector2(0, 0);
    this.joystickActive = false;

    // Eventos de entrada: activa el joystick si se toca dentro de la base
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
      // Al soltar, se reinicia el joystick
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
    // Limita la distancia máxima para que el knob no se salga de la base
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    const knobX = baseX + clampedDistance * Math.cos(angle);
    const knobY = baseY + clampedDistance * Math.sin(angle);
    this.joystickKnob.setPosition(knobX, knobY);

    // Normaliza el vector para obtener valores entre -1 y 1
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

  update() {
    if (this.gameOver) return;

    const acceleration = 600;
    const vec = this.gameState.joystickVector;
    // Aplica la aceleración en función del vector del joystick
    this.player.setAccelerationX(vec.x * acceleration);
    this.player.setAccelerationY(vec.y * acceleration);

    this.opponentBehavior();

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
      Phaser.Math.Between(100, this.cameras.main.width - 100),
      Phaser.Math.Between(100, this.cameras.main.height - 100),
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
    if (!this.gameState.opponentPowerUp) {
      let closestPowerUp = null;
      let closestDistance = Infinity;
      this.powerUps.getChildren().forEach((pu) => {
        if (!pu.active) return;
        let d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, pu.x, pu.y);
        if (d < closestDistance) {
          closestDistance = d;
          closestPowerUp = pu;
        }
      });
      if (closestPowerUp) {
        this.physics.moveToObject(this.opponent, closestPowerUp, 150);
      } else {
        this.physics.moveToObject(this.opponent, this.player, 100);
      }
    } else {
      this.physics.moveToObject(this.opponent, this.player, 200);
      let d = Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, this.player.x, this.player.y);
      if (d < 300) {
        this.opponentAttack();
      }
    }
  }

  endGame(winner) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.bgMusic.stop();
    this.scene.start("EndScene", { winner });
  }
}