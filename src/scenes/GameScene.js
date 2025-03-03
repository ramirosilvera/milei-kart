export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.setupScene();
    this.setupPhysics();
    this.setupControls();
    this.setupTimers();

    // Inicialización de power‑ups para jugador y oponente
    this.gameState.playerPowerUp = null;
    this.gameState.opponentPowerUp = null;
    this.gameState.opponentAttackCooldown = false;

    // Lanzamos la UIScene para la interfaz de usuario
    this.scene.launch("UIScene");

    // Programamos las comprobaciones de impactos optimizadas cada 200ms
    this.time.addEvent({
      delay: 200,
      callback: this.checkBulletImpactsOptimized,
      callbackScope: this,
      loop: true,
    });
    // También programamos la recogida de power‑ups de forma periódica
    this.time.addEvent({
      delay: 200,
      callback: this.checkPowerUpCollectionsOptimized,
      callbackScope: this,
      loop: true,
    });
  }

  // ─────────────────────────────
  // Configuración del escenario y estado inicial
  // ─────────────────────────────
  setupScene() {
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "track")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();

    this.gameState = {
      playerHealth: 100,
      opponentHealth: 100,
      attackCooldown: false,
      playerInvulnerable: false,
      opponentInvulnerable: false,
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
    };

    this.gameOver = false;
  }

  // ─────────────────────────────
  // Creación del jugador, oponente y grupos (sin overlap físico)
  // ─────────────────────────────
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

    this.playerBullets = this.physics.add.group();
    this.opponentBullets = this.physics.add.group();
    this.powerUps = this.physics.add.group();
  }

  // ─────────────────────────────
  // Controles: Joystick estilo Super Nintendo y botón de ataque
  // ─────────────────────────────
  setupControls() {
    this.setupJoystick();
    this.setupAttackButton();
  }

  setupJoystick() {
    const baseX = 100, baseY = this.cameras.main.height - 100;
    const radius = 50;

    this.upButton = this.add.circle(baseX, baseY - 70, radius, 0x333333, 0.8).setInteractive();
    this.add.text(baseX, baseY - 70, "↑", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5);
    this.leftButton = this.add.circle(baseX - 70, baseY, radius, 0x333333, 0.8).setInteractive();
    this.add.text(baseX - 70, baseY, "←", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5);
    this.downButton = this.add.circle(baseX, baseY + 70, radius, 0x333333, 0.8).setInteractive();
    this.add.text(baseX, baseY + 70, "↓", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5);
    this.rightButton = this.add.circle(baseX + 70, baseY, radius, 0x333333, 0.8).setInteractive();
    this.add.text(baseX + 70, baseY, "→", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5);

    this.upButton.on("pointerdown", () => { this.gameState.moveUp = true; });
    this.upButton.on("pointerup", () => { this.gameState.moveUp = false; });
    this.upButton.on("pointerout", () => { this.gameState.moveUp = false; });
    this.downButton.on("pointerdown", () => { this.gameState.moveDown = true; });
    this.downButton.on("pointerup", () => { this.gameState.moveDown = false; });
    this.downButton.on("pointerout", () => { this.gameState.moveDown = false; });
    this.leftButton.on("pointerdown", () => { this.gameState.moveLeft = true; });
    this.leftButton.on("pointerup", () => { this.gameState.moveLeft = false; });
    this.leftButton.on("pointerout", () => { this.gameState.moveLeft = false; });
    this.rightButton.on("pointerdown", () => { this.gameState.moveRight = true; });
    this.rightButton.on("pointerup", () => { this.gameState.moveRight = false; });
    this.rightButton.on("pointerout", () => { this.gameState.moveRight = false; });
  }

  setupAttackButton() {
    const btnX = this.cameras.main.width - 100, btnY = this.cameras.main.height - 100;
    const radius = 60;
    this.attackButton = this.add.circle(btnX, btnY, radius, 0xff4444, 0.8).setInteractive();
    this.add.text(btnX, btnY, "ATACAR", { fontSize: "20px", fill: "#fff", fontStyle: "bold" }).setOrigin(0.5);
    this.attackButton.on("pointerdown", () => {
      this.tweens.add({
        targets: this.attackButton,
        scale: 0.9,
        duration: 100,
        ease: "Power1",
        onComplete: () => { this.handleAttack(); }
      });
    });
    this.attackButton.on("pointerup", () => {
      this.tweens.add({
        targets: this.attackButton,
        scale: 1,
        duration: 100,
        ease: "Power1"
      });
    });
  }

  // ─────────────────────────────
  // Temporizadores: spawn de power‑ups
  // ─────────────────────────────
  setupTimers() {
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true,
    });
  }

  // ─────────────────────────────
  // Ciclo principal: movimiento, comportamiento y comprobación manual
  // ─────────────────────────────
  update() {
    if (this.gameOver) return;

    const acceleration = 600;
    this.player.setAccelerationX(
      this.gameState.moveLeft ? -acceleration :
      this.gameState.moveRight ? acceleration : 0
    );
    this.player.setAccelerationY(
      this.gameState.moveUp ? -acceleration :
      this.gameState.moveDown ? acceleration : 0
    );

    this.opponentBehavior();

    if (this.gameState.playerHealth <= 0) this.endGame("opponent");
    if (this.gameState.opponentHealth <= 0) this.endGame("player");
  }

  // ─────────────────────────────
  // Optimización de la detección de impactos de balas usando spatial hashing
  // ─────────────────────────────
  checkBulletImpactsOptimized() {
    const hitThreshold = 30;
    const cellSize = 100;
    const grid = {};

    // Función auxiliar para agregar balas a la rejilla
    const addToGrid = (bullet, groupKey) => {
      if (!bullet.active) return;
      const cellX = Math.floor(bullet.x / cellSize);
      const cellY = Math.floor(bullet.y / cellSize);
      const key = cellX + "_" + cellY;
      if (!grid[key]) grid[key] = [];
      grid[key].push({ bullet, groupKey });
    };

    // Agregar balas de jugador y oponente a la rejilla
    this.playerBullets.getChildren().forEach(bullet => addToGrid(bullet, "player"));
    this.opponentBullets.getChildren().forEach(bullet => addToGrid(bullet, "opponent"));

    // Función para comprobar impactos para un target dado (jugador u oponente)
    const checkTarget = (target, targetType) => {
      const cellX = Math.floor(target.x / cellSize);
      const cellY = Math.floor(target.y / cellSize);
      for (let i = cellX - 1; i <= cellX + 1; i++) {
        for (let j = cellY - 1; j <= cellY + 1; j++) {
          const key = i + "_" + j;
          if (grid[key]) {
            grid[key].forEach(({ bullet, groupKey }) => {
              // Solo comprobar balas que no provengan del mismo grupo del target
              if (targetType === "player" && groupKey === "player") return;
              if (targetType === "opponent" && groupKey === "opponent") return;
              let d = Phaser.Math.Distance.Between(bullet.x, bullet.y, target.x, target.y);
              if (d < hitThreshold) {
                this.handleHit(bullet, target, targetType);
              }
            });
          }
        }
      }
    };

    checkTarget(this.opponent, "opponent");
    checkTarget(this.player, "player");
  }

  // ─────────────────────────────
  // Optimización de recogida de power‑ups (usando grid)
  // ─────────────────────────────
  checkPowerUpCollectionsOptimized() {
    const collectThreshold = 40;
    const cellSize = 100;
    const grid = {};

    this.powerUps.getChildren().forEach(powerUp => {
      if (!powerUp.active) return;
      const cellX = Math.floor(powerUp.x / cellSize);
      const cellY = Math.floor(powerUp.y / cellSize);
      const key = cellX + "_" + cellY;
      if (!grid[key]) grid[key] = [];
      grid[key].push(powerUp);
    });

    const checkCollection = (sprite, isPlayer) => {
      const cellX = Math.floor(sprite.x / cellSize);
      const cellY = Math.floor(sprite.y / cellSize);
      for (let i = cellX - 1; i <= cellX + 1; i++) {
        for (let j = cellY - 1; j <= cellY + 1; j++) {
          const key = i + "_" + j;
          if (grid[key]) {
            grid[key].forEach(powerUp => {
              let d = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, sprite.x, sprite.y);
              if (d < collectThreshold) {
                if (isPlayer && !this.gameState.playerPowerUp) {
                  this.collectPowerUp(this.player, powerUp);
                } else if (!isPlayer && !this.gameState.opponentPowerUp) {
                  this.collectPowerUpForOpponent(this.opponent, powerUp);
                }
              }
            });
          }
        }
      }
    };

    checkCollection(this.player, true);
    checkCollection(this.opponent, false);
  }

  // ─────────────────────────────
  // Inteligencia básica del oponente
  // ─────────────────────────────
  opponentBehavior() {
    if (!this.gameState.opponentPowerUp) {
      let closestPowerUp = null;
      let closestDistance = Infinity;
      this.powerUps.getChildren().forEach(pu => {
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

  // ─────────────────────────────
  // Funciones de ataque y balas
  // ─────────────────────────────
  handleAttack() {
    if (this.gameState.attackCooldown || !this.gameState.playerPowerUp) return;
    this.gameState.attackCooldown = true;
    this.sound.play("attackSound");
    this.attackWithPowerUp("player", this.opponent, this.gameState.playerPowerUp.type);
    this.gameState.playerPowerUp = null;
    this.time.delayedCall(1000, () => { this.gameState.attackCooldown = false; });
  }

  opponentAttack() {
    if (this.gameState.opponentAttackCooldown || !this.gameState.opponentPowerUp) return;
    this.gameState.opponentAttackCooldown = true;
    this.sound.play("attackSound");
    this.attackWithPowerUp("opponent", this.player, this.gameState.opponentPowerUp.type);
    this.gameState.opponentPowerUp = null;
    this.time.delayedCall(1000, () => { this.gameState.opponentAttackCooldown = false; });
  }

  attackWithPowerUp(user, target, powerUpType) {
    switch (powerUpType) {
      case "powerUpDesinformation":
        this.createBullet(user, target, { damage: 35, speed: 500, texture: powerUpType });
        break;
      case "powerUpRetuits":
        [-10, 0, 10].forEach(offset => {
          this.createBullet(user, target, { damage: 15, speed: 500, angleOffset: offset, texture: powerUpType });
        });
        break;
      case "powerUpShield":
        this.activateShield(user);
        break;
      case "powerUpHostigamiento":
        const bullet = this.createBullet(user, target, { damage: 20, speed: 400, texture: powerUpType });
        bullet.setData("hitCallback", targetSprite => { this.applySlowEffect(targetSprite); });
        break;
      default:
        this.createBullet(user, target, { damage: 15, speed: 500, texture: powerUpType });
    }
  }

  createBullet(user, target, options) {
    const source = user === "player" ? this.player : this.opponent;
    const bulletTexture = options.texture || "bullet";
    const bullet = user === "player"
      ? this.playerBullets.create(source.x, source.y, bulletTexture)
      : this.opponentBullets.create(source.x, source.y, bulletTexture);
    bullet.setScale(0.4);
    bullet.setData("damage", options.damage);

    let angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
    if (options.angleOffset) {
      angle += Phaser.Math.DegToRad(options.angleOffset);
    }
    this.physics.velocityFromRotation(angle, options.speed, bullet.body.velocity);
    this.tweens.add({
      targets: bullet,
      scale: 0.5,
      yoyo: true,
      duration: 300,
      repeat: -1,
    });
    this.time.delayedCall(3000, () => { if (bullet.active) bullet.destroy(); });
    return bullet;
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

  applySlowEffect(targetSprite) {
    if (targetSprite.body && targetSprite.body.velocity) {
      targetSprite.body.velocity.scale(0.5);
    }
  }

  handleHit(bullet, target, targetType) {
    if (bullet.getData("processed")) return;
    bullet.setData("processed", true);

    const isPlayer = targetType === "player";
    const healthProp = isPlayer ? "playerHealth" : "opponentHealth";
    const invulnerableProp = isPlayer ? "playerInvulnerable" : "opponentInvulnerable";

    if (this.gameState[invulnerableProp]) {
      bullet.destroy();
      return;
    }

    this.gameState[healthProp] = Phaser.Math.Clamp(
      this.gameState[healthProp] - bullet.getData("damage"),
      0,
      100
    );

    target.setTint(0xff0000);
    this.addHitParticles(target.x, target.y);
    this.time.delayedCall(300, () => target.clearTint());

    if (bullet.getData("hitCallback")) {
      bullet.getData("hitCallback")(target);
    }
    bullet.destroy();
  }

  addHitParticles(x, y) {
    const particles = this.add.particles("spark");
    const emitter = particles.createEmitter({
      x: x,
      y: y,
      speed: { min: -100, max: 100 },
      lifespan: 300,
      quantity: 10,
      scale: { start: 0.3, end: 0 },
      blendMode: "ADD",
    });
    this.time.delayedCall(300, () => particles.destroy());
  }

  // ─────────────────────────────
  // Spawn de power‑ups y recogida (sin colisiones físicas)
  // ─────────────────────────────
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
      .setAlpha(0);
    this.tweens.add({
      targets: powerUp,
      alpha: 1,
      duration: 500,
      ease: "Linear",
    });
    powerUp.tween = this.tweens.add({
      targets: powerUp,
      y: powerUp.y - 30,
      duration: 1000,
      yoyo: true,
      repeat: -1,
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

  // ─────────────────────────────
  // Fin del juego
  // ─────────────────────────────
  endGame(winner) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.bgMusic.stop();
    this.scene.start("EndScene", { winner });
  }
}