export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // Cargamos imágenes
    this.load.image("mileiKart", "assets/images/mileiKart.png");
    this.load.image("opponentKart", "assets/images/opponentKart.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("powerUpDesinformation", "assets/images/powerUpDesinformation.png");
    this.load.image("powerUpRetuits", "assets/images/powerUpRetuits.png");
    this.load.image("powerUpShield", "assets/images/powerUpShield.png");
    this.load.image("powerUpHostigamiento", "assets/images/powerUpHostigamiento.png");

    // Sonidos
    this.load.audio("bgMusic", "assets/sounds/bgMusic.mp3");
    this.load.audio("attackSound", "assets/sounds/attackSound.mp3");
    this.load.audio("motorSound", "assets/sounds/motor.mp3");
  }

  create() {
    // Pista: ancho = 1000, alto = 9000
    const worldWidth = 1000;
    const worldHeight = 9000;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Estado del juego
    this.gameState = {
      playerHealth: 100,
      opponentHealth: 100,
      joystickVector: new Phaser.Math.Vector2(0, 0),
      boostActive: false,
      // El jugador puede recoger power ups; el oponente NO
      playerPowerUp: null
    };
    this.gameOver = false;
    this.crossedFinishLine = false;

    // Cronómetro de carrera
    this.raceStartTime = this.time.now;

    this.lapText = this.add.text(20, 20, "Vueltas: 0/1", {
      fontSize: "24px",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4
    }).setScrollFactor(0);

    // Música y sonido del motor
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();
    this.playerMotorSound = this.sound.add("motorSound", { loop: true, volume: 0.2 });

    // Configuramos karts y física
    this.setupPhysics();
    this.setupControls();
    // Generamos power ups cada 2 segundos (frecuencia aumentada)
    this.setupTimers();
    this.createObstacles();

    // Obtenemos la zona de meta definida en CircuitScene
    this.finishLine = this.registry.get("finishLine");

    // Grupo de power ups (solo el jugador podrá recogerlos)
    this.powerUps = this.physics.add.group();

    // Ruta del oponente (waypoints centrados en la pista)
    this.opponentWaypoints = [
      { x: 500, y: 7500 },
      { x: 500, y: 6000 },
      { x: 500, y: 4500 },
      { x: 500, y: 3000 },
      { x: 500, y: 1500 },
      { x: 500, y: 50 } // Meta
    ];

    // El oponente NO recoge power ups, por lo que solo el jugador es considerado
    // Comprobación periódica de power ups (cada 500 ms)
    this.time.addEvent({
      delay: 500,
      callback: this.checkPowerUpCollections,
      callbackScope: this,
      loop: true
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    if (this.scene.isActive("CircuitScene")) {
      this.scene.sendToBack("CircuitScene");
    }
  }

  setupPhysics() {
    // Posición de salida centrada en la pista (parte inferior)
    this.playerStartY = 8500;
    this.player = this.physics.add.sprite(500, this.playerStartY, "mileiKart")
      .setScale(0.1)
      .setCollideWorldBounds(true)
      .setDrag(600, 600)
      .setMaxVelocity(300);

    // El oponente inicia cerca, con una ligera ventaja en velocidad (pero no superior)
    this.opponent = this.physics.add.sprite(500, this.playerStartY + 50, "opponentKart")
      .setScale(0.1)
      .setCollideWorldBounds(true);

    this.player.body.setCircle(this.player.displayWidth * 0.6);
    this.opponent.body.setCircle(this.opponent.displayWidth * 0.6);
  }

  setupControls() {
    this.setupJoystick();
    this.setupAttackButton();
  }

  setupJoystick() {
    const baseX = 100;
    const baseY = this.cameras.main.height - 100;
    const baseRadius = 80;
    this.joystickBase = this.add.circle(baseX, baseY, baseRadius, 0x444444, 0.8)
      .setDepth(1)
      .setStrokeStyle(4, 0xffffff)
      .setScrollFactor(0);
    this.joystickBaseRadius = baseRadius;

    const knobRadius = 40;
    this.joystickKnob = this.add.circle(baseX, baseY, knobRadius, 0xee1111, 0.9)
      .setDepth(2)
      .setStrokeStyle(2, 0xffffff)
      .setScrollFactor(0);

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

  setupAttackButton() {
    const btnX = this.cameras.main.width - 100;
    const btnY = this.cameras.main.height - 100;
    const radius = 60;
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
    // Power ups se generan cada 2 segundos
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });
  }

  createObstacles() {
    // Obstáculos colocados estratégicamente
    this.obstacles = [];
    const obstaclesData = [
      { x: 500, y: 8200, width: 100, height: 30 },
      { x: 480, y: 7000, width: 80, height: 80 },
      { x: 520, y: 6000, width: 50, height: 150 }
    ];
    obstaclesData.forEach(data => {
      const obstacle = this.add.rectangle(data.x, data.y, data.width, data.height, 0x666666);
      this.physics.add.existing(obstacle, true);
      this.obstacles.push(obstacle);
      this.physics.add.collider(this.player, obstacle);
      this.physics.add.collider(this.opponent, obstacle);
    });
  }

  update() {
    if (this.gameOver) return;

    // Actualizamos cronómetro y progreso
    const elapsedTime = (this.time.now - this.raceStartTime) / 1000;
    this.registry.events.emit("updateTimer", elapsedTime);
    const progress = Phaser.Math.Clamp(
      ((this.playerStartY - this.player.y) / (this.playerStartY - 0)) * 100,
      0,
      100
    );
    this.registry.events.emit("updateProgress", progress);

    // Control del sonido del motor según movimiento
    if (this.gameState.joystickVector.length() > 0.1) {
      if (!this.playerMotorSound.isPlaying) this.playerMotorSound.play();
    } else {
      if (this.playerMotorSound.isPlaying) this.playerMotorSound.stop();
    }

    // Movimiento del jugador
    const acceleration = this.gameState.boostActive ? 800 : 600;
    const vec = this.gameState.joystickVector;
    this.player.setAccelerationX(vec.x * acceleration);
    this.player.setAccelerationY(vec.y * acceleration);

    // Comportamiento del oponente (más rápido y con evasión)
    this.opponentRacingBehavior();

    // Verificamos el cruce de meta (usando la zona de detección)
    if (this.finishLine) {
      const playerCenter = this.player.getCenter();
      if (Phaser.Geom.Rectangle.ContainsPoint(this.finishLine.getBounds(), playerCenter)) {
        if (!this.crossedFinishLine) {
          this.lapText.setText("¡Meta alcanzada!");
          this.showPowerUpMessage("¡Carrera completada!", this.player.x, this.player.y - 50);
          this.crossedFinishLine = true;
          this.endGame("player");
        }
      } else {
        this.crossedFinishLine = false;
      }
    }
  }

  opponentRacingBehavior() {
    // Si no quedan waypoints, el oponente se detiene
    if (!this.opponentWaypoints || this.opponentWaypoints.length === 0) return;

    const currentWaypoint = this.opponentWaypoints[0];
    const threshold = 20;
    // Detección de obstáculos: si hay un obstáculo en frente (dentro de 200 px y lateralmente cercano),
    // se aplica un offset lateral para evadir
    let dodgeOffset = 0;
    this.obstacles.forEach(obstacle => {
      if (obstacle.y > this.opponent.y - 200 && obstacle.y < this.opponent.y && Math.abs(obstacle.x - this.opponent.x) < 60) {
        dodgeOffset = (this.opponent.x >= obstacle.x) ? 50 : -50;
      }
    });
    // Además, si se detecta un "ataque" (simulado: si hay un bullet cercano, por ejemplo) se puede incrementar el offset
    // (En este ejemplo se omite la detección de bullet para simplificar, pero se puede extender)

    if (Phaser.Math.Distance.Between(this.opponent.x, this.opponent.y, currentWaypoint.x, currentWaypoint.y) < threshold) {
      this.opponentWaypoints.shift();
    } else {
      let targetX = currentWaypoint.x + dodgeOffset;
      let targetY = currentWaypoint.y;
      // El oponente es un poco más rápido (pero sin superar al jugador)
      this.physics.moveTo(this.opponent, targetX, targetY, 170);
    }
  }

  checkPowerUpCollections() {
    // Solo el jugador recoge power ups
    const collectThreshold = 40;
    this.powerUps.getChildren().forEach(powerUp => {
      if (!powerUp.active) return;
      const dPlayer = Phaser.Math.Distance.Between(powerUp.x, powerUp.y, this.player.x, this.player.y);
      if (dPlayer < collectThreshold && !this.gameState.boostActive && !this.gameState.playerPowerUp) {
        this.collectPowerUp(this.player, powerUp);
      }
    });
  }

  collectPowerUp(sprite, powerUp) {
    // El jugador recoge el power up y lo guarda para usarlo al atacar
    powerUp.destroy();
    this.gameState.playerPowerUp = powerUp.texture.key; 
    this.showPowerUpMessage("¡Power Up recogido!", sprite.x, sprite.y - 50);
  }

  // Cuando el jugador ataca, se usa el power up recogido para aplicar el efecto opuesto al oponente
  handleAttack() {
    if (!this.gameState.playerPowerUp) return;
    // Reproducimos sonido de ataque
    this.sound.play("attackSound");
    // Dependiendo del tipo de power up, aplicamos el efecto opuesto en el oponente
    switch (this.gameState.playerPowerUp) {
      case "powerUpDesinformation":
        // Por ejemplo: reducir la velocidad del oponente
        this.applyNegativeEffect(this.opponent, 0.5);
        break;
      case "powerUpRetuits":
        // Otra opción: desorientar al oponente (jitter)
        this.applyJitter(this.opponent);
        break;
      case "powerUpShield":
        // Podríamos invertir el escudo: quitarle invulnerabilidad temporal
        this.applyNegativeEffect(this.opponent, 0.8);
        break;
      case "powerUpHostigamiento":
        // Otro efecto: provocar un breve retroceso
        this.applyKnockback(this.opponent, 100);
        break;
      default:
        // Efecto por defecto: ralentizar
        this.applyNegativeEffect(this.opponent, 0.7);
    }
    // Se consume el power up
    this.gameState.playerPowerUp = null;
  }

  // Efecto que reduce la velocidad del sprite afectado (multiplicador < 1 significa ralentización)
  applyNegativeEffect(target, speedMultiplier) {
    target.body.maxVelocity *= speedMultiplier;
    target.setTint(0x999999);
    this.showPowerUpMessage("¡Ataque recibido!", target.x, target.y - 50);
    this.time.delayedCall(3000, () => {
      target.body.maxVelocity = 300; // Se restablece al valor original
      target.clearTint();
    });
  }

  // Efecto de jitter: mueve aleatoriamente el sprite afectado por un breve periodo
  applyJitter(target) {
    this.showPowerUpMessage("¡Desorientado!", target.x, target.y - 50);
    this.tweens.add({
      targets: target,
      x: { value: target.x + Phaser.Math.Between(-30, 30), duration: 100, ease: "Sine.easeInOut", yoyo: true, repeat: 5 },
      onComplete: () => target.clearTint()
    });
    target.setTint(0xff5555);
  }

  // Efecto de knockback: empuja al sprite afectado hacia atrás
  applyKnockback(target, force) {
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    target.setVelocity(-Math.cos(angle) * force, -Math.sin(angle) * force);
    target.setTint(0xff0000);
    this.showPowerUpMessage("¡Retroceso!", target.x, target.y - 50);
    this.time.delayedCall(500, () => {
      target.clearTint();
    });
  }

  spawnPowerUp() {
    // Se generan más power ups (cada 2 segundos) y se colocan aleatoriamente en la pista
    const types = [
      "powerUpDesinformation",
      "powerUpRetuits",
      "powerUpShield",
      "powerUpHostigamiento"
    ];
    const randomType = Phaser.Utils.Array.GetRandom(types);
    const powerUp = this.powerUps.create(
      Phaser.Math.Between(50, 950),
      Phaser.Math.Between(100, 8900),
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

  showPowerUpMessage(message, x, y) {
    const msg = this.add.text(x, y, message, {
      fontSize: "24px",
      fill: "#ffcc00",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4
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

  fireBullet(user, target, options) {
    const source = (user === "player") ? this.player : this.opponent;
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
        const currentDistance = Phaser.Math.Distance.Between(targetX, targetY, target.x, target.y);
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
      this.gameState.playerHealth = Phaser.Math.Clamp(this.gameState.playerHealth - damage, 0, 100);
    } else {
      this.gameState.opponentHealth = Phaser.Math.Clamp(this.gameState.opponentHealth - damage, 0, 100);
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

  endGame(winner) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.bgMusic.stop();
    // Transición a la escena final (asegúrate de tener definida "EndScene")
    this.scene.start("EndScene", { winner });
  }
}
